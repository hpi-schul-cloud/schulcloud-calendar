const client = require('../../../infrastructure/database');
const errorMessage = require('../../utils/errorMessage');
const {
    allColumns,
    insertColumns,
    insertTemplate
} = require('./constants');

function insertExdate(params) {
    return new Promise(function (resolve, reject) {
        // TODO: check if exception exists already
        const query = `INSERT INTO exdates ${insertColumns} `
            + `VALUES ${insertTemplate} `
            + `RETURNING ${allColumns}`;
        client.query(query, params, function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows[0]);
            }
        });
    });
}

module.exports = insertExdate;
