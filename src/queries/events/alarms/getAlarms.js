const db = require('../../../infrastructure/databasePromise');
const { allColumns } = require('./constants');

async function getAlarms(eventId) {
    const query = `SELECT ${allColumns} `
        + 'FROM alarms WHERE event_id = $1 ORDER BY id ASC;';
    return db.query(query, [eventId]);
}

module.exports = getAlarms;
