module.exports = class Event {

    constructor(client, name, options = {}) {
        this.name = name;
        this.client = client;
        this.type = options.once ? 'once' : 'on';
        this.emitter = (typeof options.emitter === 'string' ? this.client[options.emitter] : options.emitter) || this.client;

    }
    async run(...args) {
        // TODO - Logging
        throw new Error(`${this.name} was not fully implemented yet.`);
    }

};