const { createLogger, format, transports, addColors } = require('winston');
const { combine, printf, timestamp, colorize } = format;


const myFormat = printf(({ level, label, messages, timestamp }) => { // eslint-disable-line no-shadow
	// TODO - Improve


	// To be able to display multiple lines at once, we take an array of split messages we iterate over.
	let log = '';
	messages.forEach(m => {

		log += `[${timestamp}] ${('[' + label.toUpperCase().replaceAll(' ', '_') + ']')} ${level}: ${m}\n`;

	});
	log = log.substring(0, log.length - 1);
	return log;
});

/*
    Font styles: bold, dim, italic, underline, inverse, hidden, strikethrough.

    Font foreground colors: black, red, green, yellow, blue, magenta, cyan, white, gray, grey.

    Background colors: blackBG, redBG, greenBG, yellowBG, blueBG magentaBG, cyanBG, whiteBG
*/

const customFormats = {
	warn: 'bold yellow whiteBG',
	error: 'bold red whiteBG',
	info: 'bold',
	debug: 'bold blue',
};

addColors(customFormats);

const logger = createLogger({
	level: process.env.LOGGER_LOG_LEVEL || 'info',
	transports: [new transports.Console({
		format: combine(
			colorize(),
			timestamp({ format: 'DD.MM.YYYY HH:mm' }),
			myFormat,
		),
	}), new transports.File({
		level: 'silly',
		filename: 'logs/winston.log',
		maxsize: 3000000,
	})],
});

module.exports = {
	info: (service, messages) => {
		logger.log({
			level: 'info',
			messages: messages,
			label: service,
		});
	},
	warn: (service, messages) => {
		logger.log({
			level: 'warn',
			messages: messages,
			label: service,
		});
	},
	error: (service, messages) => {
		logger.log({
			level: 'error',
			messages: messages,
			label: service,
		});
	},
	verbose: (service, messages) => {
		logger.log({
			level: 'verbose',
			messages: messages,
			label: service,
		});
	},
	debug: (service, messages) => {
		logger.log({
			level: 'debug',
			messages: messages,
			label: service,
		});
	},
};