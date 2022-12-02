CREATE TABLE bot.tokens (
	`token` VARCHAR(6) NOT NULL,
	`targetRole` VARCHAR(32) NOT NULL,
	`comment` TEXT NULL DEFAULT NULL,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`usedAt` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`token`)
) ENGINE = INNODB;
