const db = require('../../../infrastructure/databasePromise');
const {
    allColumns,
    insertColumns,
    insertTemplate
} = require('./constants');

async function insertAlarm(params) {
    const query = `INSERT INTO alarms ${insertColumns} `
        + `VALUES ${insertTemplate} `
        + `RETURNING ${allColumns}`;
    const result = await db.query(query, params);
    return result[0];
}

module.exports = insertAlarm;
