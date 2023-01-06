const Event = require('../../../structures/Event');

module.exports = class extends Event {
    constructor(...args) {
        super(...args, {
            once: true,
            isActive: true
        });
    }

    async run() {


        this.client.info('BOT', [
            `Bot ${this.client.user.username} is Ready!`,
            `${this.client.guilds.cache.filter(g => g.available).size} Guilds available.`
        ].join('\n'))

    }
}