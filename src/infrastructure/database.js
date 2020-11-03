const pg = require('pg');
const express = require('express');
const app = express();
const types = require('pg').types;
const INTERVAL_OID = 1186;
const config = require('../config');
const logger = require('../infrastructure/logger');

/*
pg-promise solve the issue with version 10.5.0
https://github.com/vitaly-t/pg-promise/issues/680
{
   message: 'Client has encountered a connection error and is not queryable',
   level: 'error',
   logType: 'error'
}
*/

const restart = (client, connect) => {
	client.end().then(() => {
		client = connect(db);
	}).catch((err) => {
		logger.error('Can not stop the connection', err);
		// process.exit(3) 
	});  
}

let client = null;
const connect = (db) => {
	const c = new pg.Client(db);

	return c.connect()
		.then(() => {
			logger.info('Postgres DB connected.');
			client = c;

			client.on('error', (err) => {
				logger.error('[PostGresError]', err);
				if (err.severity === 'FATAL') {
					restart(client, connect);
				}
			});

			client.query("SET intervalstyle = 'iso_8601';");
			return client;
		}).catch((err) => {
			logger.error('Postgres DB can not connected.', err);
			// process.exit(3) 
		});
}

let db;
if (app.get('env') === 'production' || app.get('env') === 'test') {
	const db_username = config.DB_USERNAME;
	const db_password = config.DB_PASSWORD;
	const db_host = config.DB_HOST;
	const db_port = config.DB_PORT;
	const db_database = config.DB_DATABASE;

	if (!db_username ||
		(app.get('env') === 'production' && !db_password) ||
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

const prom = connect(db);

types.setTypeParser(INTERVAL_OID, function(val) {
	return val.toString();
});

module.exports = (promise = false) => promise ? prom : client;
