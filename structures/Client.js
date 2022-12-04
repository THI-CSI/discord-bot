const {Client, GatewayIntentBits, Collection} = require("discord.js");
const Utils = require("./Utils");
module.exports = class DiscordBot extends Client {

    constructor(options = {}) {
        super({
            intents: [GatewayIntentBits.Guilds]
        });

        // this.validate(options);
        this.utils = new Utils(this);

        this.token = options.token;

        this.events = new Collection();
    }


    // TODO - To be added in the future, as its not currently being used. See Issue #7 by bee1850
    validate(options) {
        

        // TODO - Logging
        if (typeof options !== 'object') throw new TypeError('Options should be a type of Object.');
        
    }

    async start(token = this.token) {
        await this.utils.loadEvents();
        await super.login(token);
    }


}