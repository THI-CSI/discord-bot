const mysql = require('mysql2/promise');
const Logger = require('./Logger');

// Encryption
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const ENC_KEY = Buffer.from(process.env.ENC_K, 'hex');
const IV = Buffer.from(process.env.ENC_IV, 'hex');


const decrypt = ((encrypted) => {
	const encryptedDataString = Buffer.from(encrypted).toString('utf8');


	const decipher = crypto.createDecipheriv(algorithm, ENC_KEY, IV);
	let decryptedData = decipher.update(encryptedDataString, 'hex', 'utf8');
	decryptedData += decipher.final('utf8');
	return decryptedData;
});


const pool = mysql.createPool({
	connectionLimit: process.env.MARIADB_MAXCONNECTIONS,
	host: process.env.MARIADB_HOST,
	user: process.env.MARIADB_USER,
	password: process.env.MARIADB_USER_PASSWORD,
	database: process.env.MARIADB_DATABASE,
	port: process.env.MARIADB_PORT,
	dateStrings: true,
	queueLimit: process.env.MARIADB_QUEUELIMIT,
	waitForConnections: process.env.MARIADB_WAITFORCONNECTIONS,
});


module.exports = {
	pool: pool,
	encrypt: ((val) => {
		const cipher = crypto.createCipheriv(algorithm, ENC_KEY, IV);
		let encrypted = cipher.update(val, 'utf8', 'hex');
		encrypted += cipher.final('hex');
		return encrypted;
	}),
	query: (sql, values) => {
		return new Promise(async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
			try {
				const result = await pool.query(sql, values);
				Logger.debug('DATABASE', ['NEW QUERY EXECUTED:', `${sql.replace(/\?/g, function() {
					return values.shift();
				})}`]);
				return resolve(result);
			}
			catch (e) {
				Logger.debug('DATABASE', ['NEW QUERY FAILED:', `${sql.replace(/\?/g, function() {
					return values.shift();
				})}`, `Error: ${e.message}`]);
				return reject(e);
			}
		});
	},
	select: (sql, values) => {
		return new Promise(async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
			try {

				const [response] = await pool.query(sql, values);

				// prepare messages array for the logger
				const messages = ['NEW QUERY EXECUTED:', `${sql.replace(/\?/g, function() {
					return values.shift();
				})}`, 'RESPONSES: '];


				const decryptedResults = response.map(row => {
					// Create a new object to store the decrypted data
					const decryptedRow = {};

					// Iterate over each column in the row
					for (const [column, value] of Object.entries(row)) {
						// Check if the data in the column is encrypted by trying to decrypt it
						try {
							// Use the decryption key to attempt to decrypt the data

							const decryptedValue = decrypt(value);

							// If the decryption was successful, the data is encrypted
							Logger.debug('DATABASE', [`Data in column "${column}" is encrypted`]);


							decryptedRow[column] = decryptedValue;
						}
						catch (err) {
							// If the decryption failed, the data is not encrypted
							Logger.debug('DATABASE', [`Data in column "${column}" is not encrypted`]);
							decryptedRow[column] = value;
						}


					}

					return decryptedRow;
				});


				// iterate through every result and add it to the message array
				let i = 0;
				decryptedResults.forEach(r => {
					messages.push(JSON.stringify(r));
					i++;
				});
				if (i === 0) messages.push('NONE');

				// finally, log to console.
				Logger.debug('DATABASE', messages);

				// resolve, as the retrieval and decryption was successful
				resolve(decryptedResults);
			}
			catch (e) {
				Logger.error('DATABASE', ['NEW QUERY FAILED:', `SQL: ${sql.replace(/\?/g, function() {
					return values.shift();
				})}`, `Error: ${e}`]);
				reject(e);
			}
		});
	},
};

