const Command = require('../../structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Authenticate yourself with a pregenerated Token!',
			isActive: true,
			requiredPerms: [],
		});
	}

	async run(interaction) {

		if (interaction.guild.available) {
			try {
				await interaction.deferReply({ ephemeral: true });
				const token = interaction.options.getString('token');
				const member = interaction.member;

				// Select token from DB
				const selectSql = 'SELECT * FROM tokens WHERE token = ?';
				const selectValues = [token];
				const selectResults = await this.client.db.select(selectSql, selectValues);

				if (selectResults.length === 0 || selectResults[0]?.usedAt !== null) {
					return interaction.editReply({
						content: 'The submitted Token was not found. Please check it and try again. If this is an Error, please contact Moderators with a screenshot of this message.',
						ephemeral: true,
					});
				}
				else {
					// Token found.
					let userMessage = 'Submitted Token found!\nTrying to associate the corresponding Role\n';
					await interaction.editReply({ content: userMessage });
					const targetRoleId = selectResults[0].targetRole;
					const role = await interaction.guild.roles.fetch(targetRoleId).catch(() => null);

					if (!role) {
						userMessage += `Error! Cannot find the Role with the Role ID ${targetRoleId}! Are you in the right Guild?\nCancelling...`;
						return await interaction.editReply({ content: userMessage });
					}

					userMessage += `Success! Found ${role}! Trying to assign it...\n`;
					await interaction.editReply({ content: userMessage });

					if (!member.roles.cache.has(targetRoleId) && member.manageable) {
						await member.roles.add(role);
						userMessage += `Added Role ${role}\n`;
					}
					else {
						userMessage += 'It seems like you already have the role or I cannot assign you any roles. Please check. This Token will be burned for Security Reasons.';
					}
					await interaction.editReply({ content: userMessage });

					// Burn Token
					const currentDate = new Date();

					const burnSql = 'UPDATE `tokens` SET `usedAt` = ? WHERE `token` = ?; ';
					const burnValues = [currentDate, token];
					await this.client.db.query(burnSql, burnValues);
				}
			}
			catch (e) {
				this.client.logger.error('INTERNAL', ['Error while trying to authenticate User', e.message]);
			}
		}


	}
};