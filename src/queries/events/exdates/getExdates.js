const db = require('../../../infrastructure/databasePromise');
const { allColumns } = require('./constants');

async function getExdates(eventId) {
    const query = `SELECT ${allColumns} `
        + 'FROM exdates WHERE event_id = $1 ORDER BY id ASC;';
    return db.query(query, [eventId]);
}

module.exports = getExdates;
