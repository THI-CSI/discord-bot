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

/*
CREATE TABLE bot.users (
  `userId` VARCHAR(20) PRIMARY KEY,
  `data` LONGBLOB
);
*/

CREATE TABLE bot.role_permissions (
  `permissionId` VARCHAR(50) DEFAULT UUID(),
  `roleId` VARCHAR(20) NOT NULL,
  `permission` VARCHAR(255) NOT NULL,
  `comment` VARCHAR(255) DEFAULT NULL,
  `grantedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `grantedBy` VARCHAR(20) NULL DEFAULT NULL,
  PRIMARY KEY (`permissionId`),
  FOREIGN KEY (`roleId`) REFERENCES `roles`(`roleId`),
  FOREIGN KEY (`grantedBy`) REFERENCES `users`(`userId`)
) ENGINE=INNODB;

/*
CREATE TABLE bot.user_permissions (
  `permissionId` VARCHAR(50) DEFAULT UUID(),
  `userId` VARCHAR(20) NOT NULL,
  `permission` VARCHAR(255) NOT NULL,
  `comment` VARCHAR(255) DEFAULT NULL,
  `grantedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `grantedBy` VARCHAR(20) NULL DEFAULT NULL,
  PRIMARY KEY (`permissionId`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`userId`),
  FOREIGN KEY (`grantedBy`) REFERENCES `users`(`userId`)
) ENGINE=INNODB;

*/
