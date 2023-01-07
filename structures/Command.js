module.exports = class Command {

	constructor(client, name, options = {}) {
		this.client = client;
		this.aliases = options.aliases || [];
		this.name = options.name || name;
		this.description = options.description || 'No description given';
		this.category = options.category || 'users';
		this.isActive = options.isActive || false;
		this.requiredPerms = options.requiredPerms || [];
	}


	async run(message, args) { // eslint-disable-line no-unused-vars
		throw new Error(`Command ${this.name} doesn't provide a run method!`);
	}

};