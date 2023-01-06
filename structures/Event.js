module.exports = class Event {

    constructor(client, name, options = {}) {
        this.name = name;
        this.client = client;
        this.type = options.once ? 'once' : 'on';
        this.isActive = options.isActive;
        this.emitter = (typeof options.emitter === 'string' ? this.client[options.emitter] : options.emitter) || this.client;

    }
    async run(...args) {
        this.client.logger.error('INTERNAL', [`${this.name} Event does not have a run method!`])
        throw new Error(`${this.name} was not fully implemented yet.`);
    }

};