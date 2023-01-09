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
			const self = await interaction.guild.members.fetchMe();
			const selfRolesHighest = await self.roles.highest;

			const role = interaction.options.getRole('role');
			const comment = interaction.options.getString('comment') ?? 'NULL';

			// Check if User has the required Permissions
			let permsSelectSql = 'SELECT permission from user_permissions WHERE userId = ?';
			const permsSelectValues = [interaction.user.id];

			const memberRoles = interaction.member.roles.cache;

			if (memberRoles.size > 0) {
				permsSelectSql += ' UNION SELECT permission from role_permissions WHERE ';
				memberRoles.forEach(cachedRole => {
					permsSelectSql += 'roleId = ? OR ';
					permsSelectValues.push(cachedRole.id);
				});
				permsSelectSql = permsSelectSql.substring(0, permsSelectSql.length - 4) + ';';
			}

			let permsSelectResult = await this.client.db.select(permsSelectSql, permsSelectValues);

			permsSelectResult = permsSelectResult.map(row => row.permission);

			if (!this.requiredPerms.every(element => permsSelectResult.includes(element))) {
				return interaction.editReply({
					content: `You do not have all of the required Permissions to run this command!\nRequired Permissions: **${this.requiredPerms.join(', ')}**\nYour Permissions: **${permsSelectResult.join(', ')}**`,
					ephemeral: true,
				});
			}

			// Check if we can use this role in the future
			if (role.managed) {
				return interaction.reply({
					content: 'The specified Role is being managed by another service.',
					ephemeral: true,
				});
			}

			// Check if our highest Role is higher than the mentioned role
			if (role.comparePositionTo(selfRolesHighest) >= 0) {
				return interaction.reply({
					content: 'The specified Role is higher than or equal to any of mine and thus not managable by me.',
					ephemeral: true,
				});
			}


			// Check if Role is already registered


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

			this.client.logger.verbose('SERVICE', [`A new Role (${role.id}) was registered for Server ${role.guild.id} by User with the Id ${interaction.user.id}!`]);
			return interaction.reply({
				content: 'The Role was successfully registered into the Database!',
				ephemeral: true,
			}).catch(e => this.client.logger.error('API', ['Error while trying to reply to an Interaction:', e.message]));


		}


	}
};