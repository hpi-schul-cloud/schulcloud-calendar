const db = require('../../infrastructure/databasePromise');
const { allColumns } = require('./constants');

async function deleteEvents(eventId, scopeId) {
	let params = [eventId];
	let query = 'DELETE FROM events WHERE event_id = $1 ';
	if (scopeId) {
		params = [...params, scopeId];
		query += 'AND scope_id = $2 ';
	}
	query += `RETURNING ${allColumns}`;
	return db.query(query, params);
}

module.exports = deleteEvents;
