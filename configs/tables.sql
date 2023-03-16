CREATE TABLE servers (
  `serverId` VARCHAR(20) PRIMARY KEY NOT NULL,
  `data` LONGBLOB,
  `iv` VARCHAR(32) NOT NULL
) ENGINE = INNODB;

CREATE TABLE bot.roles (
  `roleId` VARCHAR(20) PRIMARY KEY NOT NULL,
  `serverId` VARCHAR(20) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `comment` VARCHAR(255) DEFAULT NULL
) ENGINE=INNODB;

CREATE TABLE bot.tokens (
	`token` VARCHAR(6) NOT NULL DEFAULT UUID(),
	`targetRole` VARCHAR(20) NOT NULL,
	`comment` TEXT NULL DEFAULT NULL,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`usedAt` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`token`),
	FOREIGN KEY (`targetRole`) REFERENCES `roles` (`roleId`)
) ENGINE = INNODB;


CREATE TABLE bot.users (
  `userId` VARCHAR(20) PRIMARY KEY,
  `data` LONGBLOB
);

CREATE TABLE scopes (
  `scopeName` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`scopeName`)
) ENGINE=INNODB;

INSERT INTO `scopes` (`scopeName`) VALUES ('global'), ('guild');

CREATE TABLE permissions (
  `permissionName` VARCHAR(255) NOT NULL,
  `scope` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`permissionName`),
  FOREIGN KEY (`scope`) REFERENCES `scopes`(`scopeName`)
) ENGINE=INNODB;

CREATE TRIGGER uppercase_permission_names
BEFORE INSERT ON permissions
FOR EACH ROW
SET NEW.permissionName = UPPER(REPLACE(NEW.permissionName,' ', '_'));

INSERT INTO `permissions` (`permissionName`, `scope`) VALUES ('*', 'global'), ('GLOBAL_ADMIN', 'global'), ('GUILD_ADMIN', 'guild'), ('MANAGE_GUILD', 'guild'), ('MANAGE_ROLES_GUILD', 'guild'), ('MANAGE_TOKENS_GUILD', 'guild');

CREATE TABLE permission_overwrites (
  `permissionName` VARCHAR(255) NOT NULL,
  `overwrites` VARCHAR(255) NOT NULL,
  FOREIGN KEY (`permissionName`) REFERENCES `permissions` (`permissionName`),
  FOREIGN KEY (`overwrites`) REFERENCES `permissions` (`permissionName`)
) ENGINE=INNODB;

INSERT INTO `permission_overwrites` (`permissionName`, `overwrites`) VALUES ('*', 'GLOBAL_ADMIN'), ('GLOBAL_ADMIN', 'GUILD_ADMIN'), ('GUILD_ADMIN', 'MANAGE_GUILD'), ('GUILD_ADMIN', 'MANAGE_ROLES_GUILD'), ('GUILD_ADMIN', 'MANAGE_TOKENS_GUILD');

CREATE TABLE bot.role_permissions (
  `permissionId` VARCHAR(50) DEFAULT UUID(),
  `roleId` VARCHAR(20) NOT NULL,
  `permission` VARCHAR(255) NOT NULL,
  `comment` VARCHAR(255) DEFAULT NULL,
  `grantedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `grantedBy` VARCHAR(20) NULL DEFAULT NULL,
  PRIMARY KEY (`permissionId`),
  FOREIGN KEY (`roleId`) REFERENCES `roles`(`roleId`),
  FOREIGN KEY (`grantedBy`) REFERENCES `users`(`userId`),
  FOREIGN KEY (`permission`) REFERENCES `permissions`(`permissionName`)
) ENGINE=INNODB;


CREATE TABLE bot.user_permissions (
  `permissionId` VARCHAR(50) DEFAULT UUID(),
  `userId` VARCHAR(20) NOT NULL,
  `permission` VARCHAR(255) NOT NULL,
  `comment` VARCHAR(255) DEFAULT NULL,
  `grantedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `grantedBy` VARCHAR(20) NULL DEFAULT NULL,
  PRIMARY KEY (`permissionId`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`userId`),
  FOREIGN KEY (`grantedBy`) REFERENCES `users`(`userId`),
  FOREIGN KEY (`permission`) REFERENCES `permissions`(`permissionName`)
) ENGINE=INNODB;


