const Event = require('../../../structures/Event');


module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			once: false,
			isActive: true,
		});
	}
	async run(interaction) {

		// https://discord.js.org/#/docs/discord.js/main/class/CommandInteraction
		// return interaction.reply({ephemeral: true, content: `The ${this.name} Event works!`});

		// Placeholder...
		const commandName = interaction.commandName;

		const command = this.client.commands.get(commandName.toLowerCase());
		const args = interaction.options;

		// Check if command is actually still supported by us. Eliminates the Risk of deprecated Commands crashing the Bot.
		if (command) {
			/*
            * Everything went fine:
            * Call the Command file and run the message
            */
			return command.run(interaction, args);
		}


	}
};