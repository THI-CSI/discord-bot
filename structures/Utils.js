const path = require('path');
const {promisify} = require('util');
const glob = promisify(require('glob'));
const Event = require('./Event');
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
        return `${path.dirname(require.main.filename)}${path.sep}`.replace(/\\/g, "/");
    }

    async loadEvents() {
        this.client.events.clear();
        return glob(`${this.directory}events/**/*.js`).then(events => {
            for (const eventFile of events) {
                delete require.cache[eventFile];
                const {name} = path.parse(eventFile);
                const File = require(eventFile);
                // TODO - Logging
                if (!this.isClass(File)) {
                    this.client.logger.error('INTERNAL', [`The Event ${name} does not export a class.`])
                    throw new TypeError(`The Event ${name} does not export a class.`);
                }
                const event = new File(this.client, name);
                // TODO - Logging
                if (!(event instanceof Event)) {
                    this.client.logger.error('INTERNAL', [`The Event ${name} is not an instance of Event`])
                    throw new TypeError(`The Event ${name} is not an instance of Event`);
                }
                if (event.isActive) {
                    this.client.logger.debug('INTERNAL', [`Event ${event.name} was loaded!`])
                    this.client.events.set(event.name, event);
                    event.emitter[event.type](name, (...args) => event.run(...args));
                }

            }
        });
    }

    encryptJSON (json) {
        return this.client.db.encrypt(JSON.stringify(json));
    }
}