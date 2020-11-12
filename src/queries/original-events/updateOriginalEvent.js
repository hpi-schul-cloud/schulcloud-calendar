const db = require('../../infrastructure/databasePromise');

async function updateOriginalEvent(params) {
	const query = 'UPDATE original_events SET original_event = $2 WHERE event_id = $1';
	const result = await db.query(query, params);
	return result[0];
}

module.exports = updateOriginalEvent;
