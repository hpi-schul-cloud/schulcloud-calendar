const db = require('../../infrastructure/databasePromise');

async function deleteOriginalEvent(params) {
	const query = 'DELETE FROM original_events WHERE event_id = $1';
	const result = await db.query(query, params);
	return result[0];
}

module.exports = deleteOriginalEvent;
