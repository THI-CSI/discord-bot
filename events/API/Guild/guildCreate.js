const Event = require('../../../structures/Event');
const {
	PermissionFlagsBits,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandRoleOption,
	SlashCommandIntegerOption,
} = require('discord.js');

module.exports = class extends Event {
	constructor(...args) {
		super(...args, {
			isActive: true,
		});
	}

	async run(guild) {

		const authenticationCommand = new SlashCommandBuilder()
			.setName('authenticate')
			.setNameLocalization('de', 'authentifizieren')
			.setDMPermission(false)
			.setDescription('Authenticate yourself on this Server')
			.setDescriptionLocalization('de', 'Authentifiziere dich auf diesem Server')
			.addStringOption(new SlashCommandStringOption().setMaxLength(Number.parseInt(process.env.TOKENS_MAX_LENGTH)).setName('token').setRequired(true).setDescription(`The Token you were given. ${process.env.TOKENS_MAX_LENGTH}-Characters`)
				.setDescriptionLocalization('de', `Dein erhaltener Token. ${process.env.TOKENS_MAX_LENGTH}-Stellig`),
			).toJSON();

		const registerRoleCommand = new SlashCommandBuilder()
			.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
			.setName('registerrole')
			.setNameLocalization('de', 'rolleregistrieren')
			.setDMPermission(false)
			.setDescription('Register a new Role to the Bot')
			.setDescriptionLocalization('de', 'Registriere eine neue Rolle im Bot')
			.addRoleOption(new SlashCommandRoleOption().setName('role').setNameLocalization('de', 'rolle').setRequired(true).setDescription('The Role that will be registered!').setDescriptionLocalization('de', 'Die zu registrierende Rolle!'))
			.addStringOption(new SlashCommandStringOption().setName('comment').setNameLocalization('de', 'kommentar').setRequired(false).setDescription('Optional comment that will be saved alongside the role.').setDescriptionLocalization('de', 'Optionaler Kommentar der mit der Rolle gespeichert wird!')).toJSON();


		const createTokenCommand = new SlashCommandBuilder()
			.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
			.setName('createtoken')
			.setNameLocalization('de', 'tokenserstellen')
			.setDMPermission(false)
			.setDescription('Create new Tokens for this server')
			.setDescriptionLocalization('de', 'Erstelle neue Tokens für diesen Server')
			.addIntegerOption(new SlashCommandIntegerOption().setMaxValue(50).setMinValue(1).setName('amount').setNameLocalization('de', 'menge').setRequired(true).setDescription('How many tokens should be created').setDescriptionLocalization('de', 'Wie viele Tokens sollen erstellt werden?'))
			.addRoleOption(new SlashCommandRoleOption().setName('role').setNameLocalization('de', 'rolle').setRequired(true).setDescription('The Role that will be registered!').setDescriptionLocalization('de', 'Die zu registrierende Rolle!'))
			.addStringOption(new SlashCommandStringOption().setName('comment').setNameLocalization('de', 'kommentar').setRequired(false).setDescription('Optional comment that will be saved alongside the Tokens.').setDescriptionLocalization('de', 'Optionaler Kommentar der mit den Tokens gespeichert wird!')).toJSON();

		const guildCommands = await guild.commands.fetch();

		// Check if Guild Commands already have our command (Is this needed?)
		// TODO
		if (!guildCommands.find(v => v.name === 'authenticate' || v.name === 'registerrole' || v.name === 'createtokens')) {
			await guild.commands.create(registerRoleCommand).catch(err => this.client.logger.error('SLASHCOMMADNS', ['Failed creating a slash command:', err.message]));
			await guild.commands.create(createTokenCommand).catch(err => this.client.logger.error('SLASHCOMMADNS', ['Failed creating a slash command:', err.message]));
			await guild.commands.create(authenticationCommand).then(() => this.client.logger.info('GUILDS', [`JOINED A GUILD: ${guild.name}, ${guild.memberCount} Members, ID: ${guild.id}, Owner: ${guild.ownerId}`])).catch(err => this.client.logger.error('SLASHCOMMADNS', ['Failed creating a slash command:', err.message]));

		}


	}
};