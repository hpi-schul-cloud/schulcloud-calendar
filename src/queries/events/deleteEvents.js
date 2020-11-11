const db = require('../../infrastructure/databasePromise');
const { allColumns } = require('./constants');

async function deleteEvents(eventId, scopeIds) {
	let query = `DELETE FROM events WHERE event_id = $1 AND scope_id = ANY($2) RETURNING ${allColumns}`;
	let params = [eventId, scopeIds];

	return db.query(query, params);
}

module.exports = deleteEvents;
