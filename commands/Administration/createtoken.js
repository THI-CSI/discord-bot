const Command = require('../../structures/Command');
const { EmbedBuilder } = require('discord.js');
module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Creates new Tokens for a specified Role.',
			isActive: true,
			requiredPerms: ['MANAGE_TOKENS_GUILD'],
		});

	}

	async run(interaction) {

		if (interaction.guild.available) {

			try {
				// Check if Role is in DB
				await interaction.deferReply({ ephemeral: true });

				const role = interaction.options.getRole('role');
				const guild = interaction.guild;
				const amount = interaction.options.getInteger('amount');
				const comment = interaction.options.getString('comment') ?? 'NULL';

				const privCheck = await this.client.utils.checkUserPrivilege(interaction, this.requiredPerms);
				if (!privCheck.success) {
					return interaction.reply({
						content: `You do not have all of the required Permissions to run this command!\nRequired Permissions: **${this.requiredPerms.join(', ')}**\nYour Permissions:  **${privCheck.perms.join(', ').length > 0 ? privCheck.perms.join(', ') : "None"}**`,
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

				const selectSql = 'SELECT * from roles WHERE serverId = ?;';
				const selectValues = [guild.id];
				const selectResult = await this.client.db.select(selectSql, selectValues).catch(() => {
					return interaction.editReply({
						content: 'There was an internal Error regarding your query. Please contact the Maintainer with the ServerID and the current Date.',
						ephemeral: true,
					});
				});

				let roleFound = false;
				const foundRoles = [];
				for (const resultRole of selectResult) {
					if (resultRole.roleId === role.id) roleFound = true;
					const fresultRole = await interaction.guild.roles.fetch(resultRole.roleId);
					foundRoles.push(fresultRole);
				}

				if (!roleFound) {
					return interaction.editReply({
						content: `You have to register the role ${role} with \`/registerrole\` first, to be able to create Tokens for it!\nCurrently the following Roles are registered for your Server:\n${foundRoles.length > 0 ? `${foundRoles.join('\n').substring(0, 800)}` : 'None'}`,
						ephemeral: true,
					});
				}

				const tokens = [];

				for (let i = 0; i < amount; i++) {
					const insertSql = 'INSERT INTO tokens (token, targetRole, comment, createdAt) VALUES (SUBSTR(REPLACE(UUID(), \'-\', \'\'), 1, 6), ?, ?, NOW()) RETURNING `token`;';
					const insertValues = [role.id, comment];
					const insertResult = await this.client.db.query(insertSql, insertValues);
					const token = insertResult[0][0].token;
					tokens.push(token);
					this.client.verbose('TOKEN', [`Token '${token}' was generated for the Role with the following ID: ${role.id} on the Guild with the following ID: ${guild.id} by User ID: ${interaction.user.id}`]);
				}

				const embed = new EmbedBuilder()
					.setTitle('Your Tokens')
					.setColor('Random')
					.setDescription(`${comment !== 'NULL' ? `Comment: ${comment.substring(0, 25)}\n` : ''}Generated Amount: ${tokens.length}\`\`\`\n${tokens.join('\n')}\n\`\`\``)
					.setAuthor({
						name: interaction.member.user.tag,
						iconURL: interaction.member.displayAvatarURL({ size: 128, forceStatic: true }),
					});


				return await interaction.editReply({
					embeds: [embed],
					ephemeral: true,
				}).catch(e => this.client.error('API', ['Error while replying to a interaction', e.message]));

			}
			catch (e) {
				this.client.error('INTERNAL', ['Error while trying to create Tokens!', e.message]);
				return await interaction.editReply({
					content: 'There was an internal Error regarding your query. Please contact the Maintainer with the ServerID and the current Date.',
					ephemeral: true,
				});
			}


		}


	}
};