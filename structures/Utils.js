const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const Event = require('./Event');
const Command = require('./Command');

module.exports = class Utils {

	constructor(client) {
		this.client = client;
	}

	isClass(input) {
		return typeof input === 'function' &&
            typeof input.prototype === 'object' &&
            input.toString().substring(0, 5) === 'class';
	}
	get directory() {
		return `${path.dirname(require.main.filename)}${path.sep}`.replace(/\\/g, '/');
	}

	async loadEvents() {
		this.client.events.clear();
		return glob(`${this.directory}events/**/*.js`).then(events => {
			for (const eventFile of events) {
				delete require.cache[eventFile];
				const { name } = path.parse(eventFile);
				const File = require(eventFile);
				// TODO - Logging
				if (!this.isClass(File)) {
					this.client.error('INTERNAL', [`The Event ${name} does not export a class.`]);
					throw new TypeError(`The Event ${name} does not export a class.`);
				}
				const event = new File(this.client, name);
				// TODO - Logging
				if (!(event instanceof Event)) {
					this.client.error('INTERNAL', [`The Event ${name} is not an instance of Event`]);
					throw new TypeError(`The Event ${name} is not an instance of Event`);
				}
				if (event.isActive) {
					this.client.verbose('INTERNAL', [`Event ${event.name} was loaded!`]);
					this.client.events.set(event.name, event);
					event.emitter[event.type](name, (...args) => event.run(...args));
				}

			}
		});
	}

	async loadCommands() {
		this.client.commands.clear();
		return glob(`${this.directory}commands/*/*.js`).then(commands => {
			for (const commandFile of commands) {
				delete require.cache[commandFile];
				const { name } = path.parse(commandFile);
				const File = require(commandFile);
				if (!this.isClass(File)) {
					this.client.error('INTERNAL', [`The Command ${name} does not export a class.`]);
					throw new TypeError(`The Command ${name} does not export a class.`);
				}
				const command = new File(this.client, name.toLowerCase());
				if (!(command instanceof Command)) {
					this.client.error('INTERNAL', [`The Command ${name} is not an instance of Event`]);
					throw new TypeError(`The Command ${name} is not an instance of Command.`);
				}
				if (command.isActive) {
					this.client.verbose('INTERNAL', [`Command ${command.name} was loaded!`]);
					this.client.commands.set(command.name, command);
				}

			}
		});
	}

	async checkUserPrivilege(interaction, requiredPerms) {
		const selectSQL = 'SELECT * FROM permission_overwrites';
		const selectResult = await this.client.db.select(selectSQL);
		await interaction.member.fetch();
		const userPerms = await this.userPermissions(interaction.member.id, interaction.member.roles.cache);

		if (requiredPerms.every(element => userPerms.includes(element))) {
			return { success: true, perms: userPerms };
		}

		// find every missing permission in userperms
		const missingPerms = requiredPerms.filter(element => !userPerms.includes(element));
		let overwrittenPerms = [];
		for (const permission of missingPerms) {
			// check if permission is in selectResult and thus overwritable
			const overwritable = !!selectResult.find(row => row.overwrites === permission);

			// if permission is overwritable, check if user has permission to overwrite
			if (overwritable) {
				// check if user has the permission that overwrites the missing permission
				const index = selectResult.findIndex(row => row.overwrites === permission);
				const found = !!userPerms.find(element => element === selectResult[index].permissionName);
				if(found) {
					// find index of permission in missing Perms and remove it
					overwrittenPerms.push({permission: permission, overwritten: selectResult[index].permissionName});
				}
			}
		}

		if(missingPerms.length !== overwrittenPerms.length) {
			return { success: false, perms: userPerms, overwrittenPerms: overwrittenPerms };
		} else {
			return { success: true, perms: userPerms,  overwrittenPerms: overwrittenPerms };
		}

	}

	async userPermissions(userId, memberRoles) {
		try {
			let permsSelectSql = 'SELECT permission from user_permissions WHERE userId = ?';
			const permsSelectValues = [userId];

			if (memberRoles.size > 0) {
				permsSelectSql += ' UNION SELECT permission from role_permissions WHERE ';
				memberRoles.forEach(cachedRole => {
					permsSelectSql += 'roleId = ? OR ';
					permsSelectValues.push(cachedRole.id);
				});
				permsSelectSql = permsSelectSql.substring(0, permsSelectSql.length - 4) + ';';
			}

			let permsSelectResult = await this.client.db.select(permsSelectSql, permsSelectValues);

			return permsSelectResult.map(row => row.permission);
		} catch (e) {
			this.client.error('GUILDS', ['Error while fetching User Permissions!', e.message]);
			return [];
		}
	}

	compareRolePerms(role, me) {
		// Check if we can use this role in the future
		if (role.managed) {
			return { success: false, error: 'ROLE_MANAGED' };
		}

		// Check if our highest Role is higher than the mentioned role
		if (role.comparePositionTo(me.roles.highest) >= 0) {
			return { success: false, error: 'ROLE_HIGHER' };
		}

		return { success: true, error: null };
	}
};