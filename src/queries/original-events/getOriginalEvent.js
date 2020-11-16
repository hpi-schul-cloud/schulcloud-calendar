const db = require('../../infrastructure/databasePromise');
const { allColumns } = require('./constants');

async function getOriginalEvent(param) {
	const query = `SELECT ${allColumns} FROM original_events WHERE event_id = $1`;
	return db.query(query, [ param ]);
}

module.exports = getOriginalEvent;
