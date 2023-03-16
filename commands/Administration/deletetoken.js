const Command = require('../../structures/Command');
module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            description: 'Deletes the specified tokens.',
            isActive: true,
            requiredPerms: ['MANAGE_TOKENS_GUILD'],
        });

    }

    async run(interaction) {

        if (interaction.guild.available) {

            try {
                // Check if Role is in DB
                await interaction.deferReply({ ephemeral: true });

                const token = interaction.options.getString('token');
                const guild = interaction.guild;
                const deleteFully = interaction.options.getBoolean('fulldelete');
                const comment = interaction.options.getString('comment') ?? 'NULL';

                const privCheck = await this.client.utils.checkUserPrivilege(interaction, this.requiredPerms);
                if (!privCheck.success) {
                    return interaction.reply({
                        content: `You do not have all of the required Permissions to run this command!\nRequired Permissions: **${this.requiredPerms.join(', ')}**\nYour Permissions:  **${privCheck.perms.join(', ').length > 0 ? privCheck.perms.join(', ') : "None"}**`,
                        ephemeral: true,
                    });
                }

                // Query Database with select and check if token exists
                const selectSql = 'SELECT * from tokens WHERE token = ?;';
                const selectValues = [token];
                const selectResult = await this.client.db.select(selectSql, selectValues);
                if(selectResult.length === 0) {
                    return await interaction.editReply({
                        content: `The Token '${token}' does not exist!`,
                        ephemeral: true,
                    });
                } else if(selectResult[0].usedAt !== null && !deleteFully) {

                    const content = selectResult[0].usedAt === 0
                        ? `The Token '${token}' is already revoked!`
                        : `The Token '${token}' has already been used!`;

                    return await interaction.editReply({
                        content,
                        ephemeral: true,
                    });
                }

                // Query Database with delete and delete token
                let deleteSql, deleteValues;
                if(deleteFully) {
                    deleteSql = 'DELETE FROM tokens WHERE token = ?;';
                    deleteValues = [token];
                } else {
                    deleteSql = 'UPDATE tokens SET usedAt = 0 WHERE token = ?;';
                    deleteValues = [token];
                }
                await this.client.db.query(deleteSql, deleteValues);
                this.client.verbose('TOKEN', [`Token '${token}' was ${deleteFully ? "deleted" : "revoked"} for the Role with the following ID: ${selectResult[0].targetRole} on the Guild with the following ID: ${guild.id} by User ID: ${interaction.user.id} with the comment: ${comment}`]);

                return await interaction.editReply({
                    content: `Successfully ${deleteFully ? "deleted" : "revoked"} the Token '${token}'!`,
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