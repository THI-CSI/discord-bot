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

		const queue = [];
		const maintainerCommand = new SlashCommandBuilder()
			.setName('maintainer')
			.setDMPermission(false)
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
			.setDescription(`Current ${process.env.MAINTAINER_DISCORD_ID.split(',').length === 1 ? 'maintainer' : 'maintainers'} for this Instance`).toJSON();
		queue.push(maintainerCommand);

		const setupCommand = new SlashCommandBuilder()
			.setName('setup')
			.setDMPermission(false)
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
			.setDescription('Setup this Server to be able to use me!').toJSON();
		queue.push(setupCommand);

		await guild.commands.set([]);

		// Check if Guild Commands already have our command (Is this needed?)
		// TODO
		try {
			for (const command of queue) {
				await guild.commands.create(command);
			}
			this.client.debug('SLASHCOMMANDS', ['']);
		}
		catch (e) {
			this.client.error('SLASHCOMMANDS', ['Failed creating a slash command:', e.message]);
		}


		// try to register the guild
		const guildData = JSON.stringify({ visitorrole: '' });
		const insertSQL = 'INSERT INTO `servers` (`serverId`, `data`, `iv`) VALUES (?, ?, ?);';

		try {
			const [encrypted, IV] = this.client.db.encrypt(guildData);
			const insertValues = [guild.id, encrypted, IV];
			await this.client.db.query(insertSQL, insertValues);
		}
		catch (e) {
			this.client.error('GUILDS', ['Error while adding Guild to Database', e.message]);
		}


	}
};