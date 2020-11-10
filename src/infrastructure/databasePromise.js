const logger = require('../infrastructure/logger');
const config = require('../config');

const resolveDBCredentials = () => {
	let db;
	if (config.NODE_ENV === 'production' || config.NODE_ENV === 'test') {
		const db_username = config.DB_USERNAME;
		const db_password = config.DB_PASSWORD;
		const db_host = config.DB_HOST;
		const db_port = config.DB_PORT;
		const db_database = config.DB_DATABASE;
	
		if (!db_username ||
			(config.NODE_ENV === 'production' && !db_password) ||
			!db_host ||
			!db_port ||
			!db_database) {
			throw new Error('expected database credentials but incomplete specified');
		}
	
		if (db_password) {
			db = {
				user: db_username,
				password: db_password,
				host: db_host,
				port: db_port,
				database: db_database,
			};
		} else {
			db = {
				user: db_username,
				host: db_host,
				port: db_port,
				database: db_database,
			};
		}
	} else {
		db = {
			user: 'node',
			password: 'node',
			host: 'localhost',
			port: 5432,
			database: 'schulcloud_calendar',
		};
	}
	// https://github.com/vitaly-t/pg-promise/wiki/Connection-Syntax#configuration-object
	db.max = config.CONNECTION_POOL_SIZE;
	return db;
}

const initOptions = {
	// global event notification;
	error(error, e) {
		if (e.cn) {
			// A connection-related error;
			//
			// Connections are reported back with the password hashed,
			// for safe errors logging, without exposing passwords.
			logger.error('CN:', e.cn);
			logger.error('EVENT:', error.message || error);
		}
	}
};
	
const pgp = require('pg-promise')(initOptions);
const db = pgp(resolveDBCredentials());
	
db.connect()
	.then((obj) => {

		const serverVersion = obj.client.serverVersion;
		logger.alert(`Database connected with ${serverVersion}`);
		obj.done(); // success, release the connection;
	})
	.catch(error => {
		logger.error('ERROR:', error.message || error);
});

module.exports = db;