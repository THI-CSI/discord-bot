const Event = require('../../../structures/Event');
const {
	SlashCommandBuilder,
	PermissionFlagsBits,
} = require('discord.js');


module.exports = class extends Event {
	constructor(...args) {
		super(...args, {
			isActive: true,
		});
	}

	async run(guild) {
		const setupCommand = new SlashCommandBuilder()
			.setName('setup')
			.setDMPermission(false)
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
			.setDescription('Setup this Server to be able to use me!').toJSON();

		const guildCommands = await guild.commands.fetch();

		// Check if Guild Commands already have our command (Is this needed?)
		// TODO
		if (!guildCommands.find(v => v.name === 'setup')) {
			await guild.commands.create(setupCommand).then(() => this.client.logger.info('GUILDS', [`JOINED A GUILD: ${guild.name}, ${guild.memberCount} Members, ID: ${guild.id}, Owner: ${guild.ownerId}`])).catch(err => this.client.logger.error('SLASHCOMMADNS', ['Failed creating a slash command:', err.message]));
		}


	}
};