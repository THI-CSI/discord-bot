const Command = require('../../structures/Command');
const { ActionRowBuilder, StringSelectMenuBuilder, ComponentType, ButtonBuilder } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Configures the Guild',
			isActive: true,
			requiredPerms: ['MANAGE_GUILD'],
		});
	}

	async run(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const privCheck = await this.client.utils.checkUserPriviledge(interaction.user.id, interaction.member.roles.cache, this.requiredPerms);
		if (!privCheck.success) {
			return interaction.editReply({
				content: `You do not have all of the required Permissions to run this command!\nRequired Permissions: **${this.requiredPerms.join(', ')}**\nYour Permissions: **${privCheck.perms.join(', ')}**`,
				ephemeral: true,
			});
		}


		const row = new ActionRowBuilder()
			.addComponents(
				new StringSelectMenuBuilder()
					.setMinValues(1)
					.setMaxValues(1)
					.setCustomId('settings_topic')
					.setPlaceholder('Nothing selected')
					.addOptions(
						{
							label: 'Visitor-Role',
							description: 'Configure the Role new Members get upon joining the Server',
							value: 'visitorrole',
						},
					),
			);

		const message = await interaction.editReply({
			content: 'Please choose the Setting, you want to configure.',
			components: [row],
			fetchReply: true,
			ephemeral: true,
		});


		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.SelectMenu,
			time: 15000,
			max: 1,
		});

		collector.on('collect', async i => {

			switch (i.values[0]) {
			case 'visitorrole': {
				await this.configureVisitorrole(i);
			}
				break;

			}

		});

		collector.on('end', collected => {
			if (collected.length === 0) {
				return interaction.editReply({
					content: 'Time is up! Please try again!',
					components: [],
					ephemeral: true,
				});
			}
		});

	}

	async configureVisitorrole(interaction) {
		await interaction.deferReply({ ephemeral: true });
		// Fetch Registered Roles
		const selectSql = 'SELECT * FROM roles WHERE serverId = ?';
		const selectValues = [interaction.guild.id];

		const [selectResult] = await this.client.db.query(selectSql, selectValues);
		const availableRoles = [];
		if (selectResult.length !== 0) {
			for (const row of selectResult) {
				try {
					const role = await interaction.guild.roles.fetch(row.roleId);
					const self = await interaction.guild.members.fetchMe();
					const roleCompare = await this.client.utils.compareRolePerms(role, self);
					if (!roleCompare.success) {
						this.client.changedRoles.set(role.id, role);
					}
					else {
						availableRoles.push(role);
					}
				}
				catch (e) {
					this.client.error('ROLES', [`There was an error while trying to fetch the Role with the RoleID ${row.roleId} on ${interaction.guild.id}`]);
				}
			}
		}

		if (availableRoles.length === 0) {
			return interaction.editReply({
				content: 'It looks like you did not yet register any Roles! Please register the role with `/registerrole` first.',
				ephemeral: true,
			});
		}

		const options = availableRoles.map(r => {
			return { label: r.name, value: r.id };
		});

		const row = new ActionRowBuilder()
			.addComponents(
				new StringSelectMenuBuilder()
					.setMinValues(1)
					.setMaxValues(1)
					.setCustomId('settings_visitor_role')
					.setPlaceholder('Nothing selected')
					.addOptions(options),
			);


		const message = await interaction.editReply({
			fetchReply: true,
			ephemeral: true,
			components: [row],
			content: 'Please choose the Role you want to assign as Visitorrole.',
		});


		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.SelectMenu,
			time: 15000,
			max: 1,
		});

		collector.on('collect', async i => {


			await this.confirmVisitorRole(i, i.values[0]);

		});

		collector.on('end', collected => {
			if (collected.length === 0) {
				return interaction.editReply({
					content: 'Time is up! Please try again!',
					components: [],
					ephemeral: true,
				});
			}

		});

	}

	async confirmVisitorRole(interaction, roleId) {
		await interaction.deferReply({ ephemeral: true });
		const role = await interaction.guild.roles.fetch(roleId);

		const rolePermsSql = 'SELECT * from role_permissions WHERE roleId = ?;';
		const rolePermsValues = [role.id];
		const rolePermsResults = await this.client.db.select(rolePermsSql, rolePermsValues);

		const perms = [];
		for (const row1 of rolePermsResults) {
			perms.push(`${row1.permission} - Granted By: ${row1.grantedBy === 1 ? 'DB' : await this.client.users.fetch(row1.grantedBy)}`);
		}

		const row = new ActionRowBuilder()
			.addComponents([
				new ButtonBuilder()
					.setCustomId('settings_visitor_role_confirm')
					.setLabel('Confirm')
					.setStyle('Success')
					.setEmoji('✅'),
				new ButtonBuilder()
					.setCustomId('settings_visitor_role_cancel')
					.setLabel('Cancel')
					.setStyle('Danger')
					.setEmoji('❌'),
			]);

		const message = await interaction.editReply({ content: `Please confirm:\nThe new VisitorRole will be set as ${role} with ID: ${roleId}!${perms.length > 0 ? `\nThe Role has the following Permissions for the Bot!\n**${perms.join('**\n**')}**` : ''}\nPlease be aware that we do not check guild-permissions. The Role WILL be assigned.`, ephemeral: true, components: [row], fetchReply: true });

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 15000,
			max: 1,
		});

		collector.on('collect', async i => {

			if (i.customId === 'settings_visitor_role_confirm') {
				// fetch server data
				const selectSql = 'SELECT data,iv FROM servers WHERE serverId = ?';
				const selectValues = [i.guild.id];

				const selectResult = await this.client.db.select(selectSql, selectValues);


				if (selectResult.length !== 0) {
					// Server found
					let serverData;
					if (selectResult.data == null) {
						// Data lost, overwrite
						serverData = {};
					}
					else {
						// Data loaded
						serverData = JSON.parse(selectResult.data);
					}

					const oldRoleId = serverData.visitorRole;
					if (oldRoleId === roleId) {
						return interaction.editReply({ content: 'Same Role selected, please choose something else.', ephemeral: true, components: [] });
					}
					serverData.visitorRole = roleId;
					serverData = JSON.stringify(serverData);
					const [encrypted, iv] = this.client.db.encrypt(serverData);

					const updateSql = 'UPDATE servers SET data = ?, IV = ? WHERE serverId =  ?;';
					const updateValues = [encrypted, iv, i.guild.id];

					await this.client.db.query(updateSql, updateValues);
					this.client.verbose('GUILDS', [`User ${i.user.tag} [${i.member.user.id}] updated the Visitorrole from ${oldRoleId} to ${roleId}!, Guild: ${i.guild.name} - [${i.guild.id}]`]);
					return interaction.editReply({ content: 'The Visitor-Role was successfully updated!', ephemeral: true, components: [] });

				}
				else {
					return interaction.editReply({ content: 'Apparently your Server was not registered to the Database yet. Please contact a Maintainer via `/maintainer`!', ephemeral: true, components: [] });
				}

			}
			else {
				return interaction.editReply({ content: 'Canceled!', ephemeral: true, components: [] });
			}

		});

		collector.on('end', collected => {
			if (collected.length === 0) {
				return interaction.editReply({
					content: 'Time is up! Please try again!',
					components: [],
					ephemeral: true,
				});
			}
		});
	}
};

