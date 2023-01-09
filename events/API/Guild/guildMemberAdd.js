const Event = require('../../../structures/Event');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			isActive: true,
		});
	}

	async run(member) {

		/*
            New Member Joined - try to add Visitor Role
         */
		try {
			if (member.manageable() && !member.bot) {
				const selectSql = 'SELECT data, iv FROM servers WHERE serverId = ?';
				const selectValues = [member.guild.id];

				const selectResult = await this.client.db.select(selectSql, selectValues);

				if (selectResult.length !== 0) {
					const json = JSON.parse(selectResult[0].data);
					if (json.visitorRole != null) {
						await member.roles.add(json.visitorRole);
					}
				}

			}
		}
		catch (e) {
			this.client.error('API', ['Error while adding Role to new User', e.message]);
		}
	}
};