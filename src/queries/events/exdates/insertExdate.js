const db = require('../../../infrastructure/databasePromise');
const {
    allColumns,
    insertColumns,
    insertTemplate
} = require('./constants');

async function insertExdate(params) {
    const query = `INSERT INTO exdates ${insertColumns} `
        + `VALUES ${insertTemplate} `
        + `RETURNING ${allColumns}`;
    const result = await db.query(query, params);
    return result[0];
}

module.exports = insertExdate;
