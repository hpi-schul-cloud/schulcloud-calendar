const getClient = require('../../../infrastructure/databasePromise');
const { allColumns } = require('./constants');

async function deleteAlarms(eventId) {
    const query = 'DELETE FROM alarms '
        + 'WHERE event_id = $1 '
        + `RETURNING ${allColumns}`;
    return db.query(query, [eventId]);
}

module.exports = deleteAlarms;
