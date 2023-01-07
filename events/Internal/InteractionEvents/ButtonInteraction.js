const Event = require('../../../structures/Event');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			once: false,
			isActive: false,
		});
	}
	async run(interaction) {

		// https://discord.js.org/#/docs/discord.js/main/class/MessageComponentInteraction
		return interaction.reply({ ephemeral: true, content: `The ${this.name} Event works!` });

	}
};