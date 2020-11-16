const db = require('../../infrastructure/databasePromise');
const {
	allColumns,
	insertColumns,
	insertTemplate
} = require('./constants');

async function insertOriginalEvent(params) {
	const query = `INSERT INTO original_events ${insertColumns} `
		+ `VALUES ${insertTemplate} `
		+ `RETURNING ${allColumns}`;
	const result = await db.query(query, params);
	return result[0];
}

module.exports = insertOriginalEvent;
