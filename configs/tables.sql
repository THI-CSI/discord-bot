CREATE TABLE bot.tokens (
	`tokenId` INT NOT NULL AUTO_INCREMENT,
	`token` VARCHAR(6) NOT NULL,
	`targetRole` VARCHAR(32) NOT NULL,
	`comment` TEXT NULL DEFAULT NULL,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`usedAt` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`tokenId`)
) ENGINE = INNODB;
