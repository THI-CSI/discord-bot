const Command = require('../../structures/Command');
const {
	SlashCommandBuilder,
	SlashCommandStringOption,
	PermissionFlagsBits,
	SlashCommandRoleOption,
	SlashCommandIntegerOption,
} = require('discord.js');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Registers Guild-Slashcommands',
			isActive: true,
			requiredPerms: [],
		});
	}

	async run(interaction) {

		await interaction.deferReply({ ephemeral: true });
		await interaction.editReply({ content: `**Hello!** (Detected Locale: ${interaction.locale})\nThank you very much for adding me to your Guild! This Setup is usually pretty quick...\nStarting Setup process, please wait!` });

		const queue = [];
		// Commands will be deleted later in here - so we need to re-register it
		const setupCommand = new SlashCommandBuilder()
			.setName('setup')
			.setDMPermission(false)
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
			.setDescription('Re-Setup this Server to be able to use me!').toJSON();
		queue.push(setupCommand);

		const authenticationCommand = new SlashCommandBuilder()
			.setName('authenticate')
			.setDMPermission(false)
			.setDescription('Authenticate yourself on this Server')
			.addStringOption(new SlashCommandStringOption()
				.setMaxLength(Number.parseInt(process.env.TOKENS_MAX_LENGTH))
				.setName('token')
				.setRequired(true)
				.setDescription(`The Token you were given. ${process.env.TOKENS_MAX_LENGTH}-Characters`),
			).toJSON();
		queue.push(authenticationCommand);
		const registerRoleCommand = new SlashCommandBuilder()
			.setName('registerrole')
			.setDMPermission(false)
			.setDescription('Register a new Role to the Bot')
			.setDescriptionLocalization('de', 'Registriere eine neue Rolle im Bot')
			.addRoleOption(new SlashCommandRoleOption()
				.setName('role')
				.setRequired(true)
				.setDescription('The Role that will be registered!'))
			.addStringOption(new SlashCommandStringOption()
				.setName('comment')
				.setMaxLength(250)
				.setRequired(false)
				.setDescription('Optional comment that will be saved alongside the role.')).toJSON();

		queue.push(registerRoleCommand);
		const createTokenCommand = new SlashCommandBuilder()
			.setName('createtoken')
			.setDMPermission(false)
			.setDescription('Create new Tokens for this server')
			.addIntegerOption(new SlashCommandIntegerOption()
				.setMaxValue(50)
				.setMinValue(1)
				.setName('amount')
				.setRequired(true)
				.setDescription('How many tokens should be created'))
			.addRoleOption(new SlashCommandRoleOption()
				.setName('role')
				.setRequired(true)
				.setDescription('The Role that will be registered!'))
			.addStringOption(new SlashCommandStringOption()
				.setName('comment')
				.setMaxLength(250)
				.setRequired(false)
				.setDescription('Optional comment that will be saved alongside the Tokens.')).toJSON();
		queue.push(createTokenCommand);

		await interaction.guild.commands.set([]);

		// Check if Guild Commands already have our command (Is this needed?)
		// TODO
		try {
			for (const command of queue) {
				await interaction.guild.commands.create(command);
			}
			this.client.logger.debug('SLASHCOMMANDS', [`Added ${queue.length} new Guild-Only Slash Commands to ${interaction.guild.name}`]);
			await interaction.editReply({ content: `Cool!\n${queue.length} Commands were added to your Guild!\nIncase of any questions, feel free to DM [me](https://discord.id/?prefill=${process.env.MAINTAINER_DISCORD_ID ?? '0'})\nEnjoy!` });
		}
		catch (e) {
			this.client.logger.error('SLASHCOMMADNS', ['Failed creating a slash command:', e.message]);
		}

	}

};