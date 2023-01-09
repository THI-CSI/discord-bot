const Command = require('../../structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Registers new Roles into the Database',
			isActive: true,
			requiredPerms: ['MANAGE_ROLES_GUILD'],
		});
	}

	async run(interaction) {

		if (interaction.guild.available) {


			const role = interaction.options.getRole('role');
			const comment = interaction.options.getString('comment') ?? 'NULL';

			const privCheck = await this.client.utils.checkUserPriviledge(interaction.user.id, interaction.member.roles.cache, this.requiredPerms);
			if (!privCheck.success) {
				return interaction.reply({
					content: `You do not have all of the required Permissions to run this command!\nRequired Permissions: **${this.requiredPerms.join(', ')}**\nYour Permissions: **${privCheck.perms.join(', ')}**`,
					ephemeral: true,
				});
			}

			const self = await interaction.guild.members.fetchMe();
			const roleCompare = await this.client.utils.compareRolePerms(role, self);
			if (!roleCompare.success) {
				if (roleCompare.error === 'ROLE_HIGHER') {
					return interaction.reply({
						content: 'The specified Role is higher than or equal to any of mine and thus not managable by me.',
						ephemeral: true,
					});
				}
				else if (roleCompare.error === 'ROLE_MANAGED') {
					return interaction.reply({
						content: 'The specified Role is being managed by another service.',
						ephemeral: true,
					});
				}
			}

			try {
				const selectSql = 'SELECT * FROM `roles` WHERE `serverId` = ? AND `roleId` = ?;';
				const selectValues = [role.guild.id, role.id];


				const selectResult = await this.client.db.select(selectSql, selectValues);
				if (selectResult.length > 0) {
					return interaction.reply({
						content: 'The specified Role is already registered!',
						ephemeral: true,
					});
				}

				// Create a SQL Statement
				const sql = 'INSERT INTO `roles` (`roleId`, `serverId`, `createdAt`, `comment`) VALUES (?, ?, current_timestamp(), ?);';
				const values = [role.id, interaction.guild.id, comment];

				await this.client.db.query(sql, values);
			}
			catch (e) {
				return interaction.reply({
					content: 'An Error occoured! Please check Bot-Logs or contact the maintainer!',
					ephemeral: true,
				});
			}

			this.client.verbose('SERVICE', [`A new Role (${role.id}) was registered for Server ${role.guild.id} by User with the Id ${interaction.user.id}!`]);
			return interaction.reply({
				content: 'The Role was successfully registered into the Database!',
				ephemeral: true,
			}).catch(e => this.client.error('API', ['Error while trying to reply to an Interaction:', e.message]));


		}


	}
};