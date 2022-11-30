const {Client, GatewayIntentBits, Collection} = require("discord.js");
const Utils = require("./Utils");
module.exports = class DiscordBot extends Client {

    constructor(options = {}) {
        super({
            intents: [GatewayIntentBits.Guilds]
        });
        this.validate(options);
        this.utils = new Utils(this);

        this.events = new Collection();
    }

    validate(options) {
        // TODO - Logging
        if (typeof options !== 'object') throw new TypeError('Options should be a type of Object.');
        this.token = options.token;
    }

    async start(token = this.token) {
        await this.utils.loadEvents();
        await super.login(token);
    }


}