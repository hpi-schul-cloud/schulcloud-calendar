const db = require('../../infrastructure/databasePromise');

const {
	allColumns,
	updateColumns,
	updateTemplate
 } = require('./constants');

async function udpdateRawEvent(params) {
	const eventIdIndex = updateColumns.length + 1;
	const scopeIdIndex = updateColumns.length + 2;
	let query = 'UPDATE events '
		+ `SET ${updateTemplate} `
		+ `WHERE event_id = $${eventIdIndex} `;
	// scopeId in params
	if (params.length === updateColumns.length + 2) {
		query += `AND scope_id = $${scopeIdIndex} `;
	}
	query += `RETURNING ${allColumns}`;
	return db.query(query, params);
}

module.exports = udpdateRawEvent;
