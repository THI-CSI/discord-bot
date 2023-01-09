const Command = require('../../structures/Command');
const { MessageFlags } = require('discord.js');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Registers Guild-Slashcommands',
			isActive: true,
			requiredPerms: [],
		});
	}

	async run(interaction) {

		const maintainers = process.env.MAINTAINER_DISCORD_ID.split(',');
		let message = 'The Maintainers for this deployment of the Bot: ';
		for (const p of maintainers) {
			const user = await this.client.users.fetch(p);
			message += `[${user.tag}](https://discord.id/?prefill=${user.id}), `;
		}
		message = message.substring(0, message.length - 2);


		interaction.reply({ content:message, ephemeral: true, flags: MessageFlags.SuppressEmbeds });

	}
};