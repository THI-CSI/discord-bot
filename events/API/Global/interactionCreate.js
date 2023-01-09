const Event = require('../../../structures/Event');

module.exports = class extends Event {
	constructor(...args) {
		super(...args, {
			isActive: true,
		});
	}

	async run(interaction) {
		let interactionType = 'Unknown';
		if (interaction.isAnySelectMenu()) {

			/*
                We detected a Select Menu Interaction of any kind - Lets reroute to the according internal Event.
             */
			interactionType = 'SelectMenuInteraction';
			this.client.emit('SelectMenuInteraction', interaction);

		}
		else if (interaction.isButton()) {
			/*
                We detected a Button Interaction Event - Lets reroute to the according internal Event.
             */
			interactionType = 'ButtonInteraction';
			this.client.emit('ButtonInteraction', interaction);
		}
		else if (interaction.isChatInputCommand()) {


			/*
                We detected an Application Command Event - Lets reroute to the according internal Event.
            */
			interactionType = 'CommandInteraction';
			this.client.emit('CommandInteraction', interaction);

		}
		else if (interaction.isAutocomplete()) {
			/*
                Someone is trying to use a Autocomplete-Supported Command. Lets try to give them choices.
                Don't Log this.
                */
			this.client.emit('AutocompleteInteraction', interaction);
		}
		if (interactionType !== 'Unknown') {
			this.client.debug('EVENTS', [`New ${interactionType} Event triggered!`, `Guild: ${interaction.guild.name} [${interaction.guild.id}], Guild: ${interaction.member.user.tag} [${interaction.member.user.id}]`]);
		}

	}
};