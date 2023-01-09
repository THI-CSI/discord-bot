const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const Event = require('./Event');
const Command = require('./Command');

module.exports = class Utils {

	constructor(client) {
		this.client = client;
	}

	isClass(input) {
		return typeof input === 'function' &&
            typeof input.prototype === 'object' &&
            input.toString().substring(0, 5) === 'class';
	}
	get directory() {
		return `${path.dirname(require.main.filename)}${path.sep}`.replace(/\\/g, '/');
	}

	async loadEvents() {
		this.client.events.clear();
		return glob(`${this.directory}events/**/*.js`).then(events => {
			for (const eventFile of events) {
				delete require.cache[eventFile];
				const { name } = path.parse(eventFile);
				const File = require(eventFile);
				// TODO - Logging
				if (!this.isClass(File)) {
					this.client.error('INTERNAL', [`The Event ${name} does not export a class.`]);
					throw new TypeError(`The Event ${name} does not export a class.`);
				}
				const event = new File(this.client, name);
				// TODO - Logging
				if (!(event instanceof Event)) {
					this.client.error('INTERNAL', [`The Event ${name} is not an instance of Event`]);
					throw new TypeError(`The Event ${name} is not an instance of Event`);
				}
				if (event.isActive) {
					this.client.verbose('INTERNAL', [`Event ${event.name} was loaded!`]);
					this.client.events.set(event.name, event);
					event.emitter[event.type](name, (...args) => event.run(...args));
				}

			}
		});
	}

	async loadCommands() {
		this.client.commands.clear();
		return glob(`${this.directory}commands/*/*.js`).then(commands => {
			for (const commandFile of commands) {
				delete require.cache[commandFile];
				const { name } = path.parse(commandFile);
				const File = require(commandFile);
				if (!this.isClass(File)) {
					this.client.error('INTERNAL', [`The Command ${name} does not export a class.`]);
					throw new TypeError(`The Command ${name} does not export a class.`);
				}
				const command = new File(this.client, name.toLowerCase());
				if (!(command instanceof Command)) {
					this.client.error('INTERNAL', [`The Command ${name} is not an instance of Event`]);
					throw new TypeError(`The Command ${name} is not an instance of Command.`);
				}
				if (command.isActive) {
					this.client.verbose('INTERNAL', [`Command ${command.name} was loaded!`]);
					this.client.commands.set(command.name, command);
				}

			}
		});
	}

	encryptJSON(json) {
		return this.client.db.encrypt(JSON.stringify(json));
	}
};