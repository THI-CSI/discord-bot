const Event = require('../../../structures/Event');
const {SlashCommandBuilder, SlashCommandStringOption} = require("@discordjs/builders");

module.exports = class extends Event {
    constructor(...args) {
        super(...args, {
            once: true,
            isActive: true
        });
    }

    async run(guild) {


        const { SlashCommandBuilder, SlashCommandStringOption} = require('@discordjs/builders');
        require('dotenv').config();

        const authenticationCommand = new SlashCommandBuilder()
            .setName('authenticate')
            .setNameLocalization('de', 'authentifizieren')
            .setDMPermission(false)
            .setDescription('Authenticate yourself on this Server')
            .setDescriptionLocalization('de', 'Authentifiziere dich auf diesem Server')
            .addStringOption(new SlashCommandStringOption().setMaxLength(Number.parseInt(process.env.TOKENS_MAX_LENGTH)).setName('token').setRequired(true) .setDescription(`The Token you were given. ${process.env.TOKENS_MAX_LENGTH}-Characters`)
                .setDescriptionLocalization('de', `Dein erhaltener Token. ${process.env.TOKENS_MAX_LENGTH}-Stellig`)
            ).toJSON()

        const guildCommands = await guild.commands.fetch();

        // Check if Guild Commands already have our command (Is this needed?)

        if (!guildCommands.find( v => v.name == "authenticate")) {
            await guild.commands.create(authenticationCommand).then(() => this.client.logger.info('GUILDS', [`JOINED A GUILD: ${guild.name}, ${guild.memberCount} Members, ID: ${guild.id}, Owner: ${guild.ownerId}`])).catch(err => this.client.logger.error('SLASHCOMMADNS', ['Failed creating a slash command:', err.message]))
        }




    }
}