const db = require('../../../infrastructure/databasePromise');
const errorMessage = require('../../utils/errorMessage');
const { allColumns } = require('./constants');

function deleteAlarms(eventId) {
    const query = 'DELETE FROM exdates '
        + 'WHERE event_id = $1 '
        + `RETURNING ${allColumns}`;
    return db.query(query, [eventId]);
}

module.exports = deleteAlarms;
