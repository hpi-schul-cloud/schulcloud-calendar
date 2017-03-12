const client = require('../../../infrastructure/database');
const errorMessage = require('../../_errorMessage');
const paramsTemplate = require('../../_paramsTemplate');
const columnNames = require('./_columnNames');

function insertExdate(params) {
    return new Promise(function (resolve, reject) {
        // TODO: check if exception exists already
        const query = `INSERT INTO exdates (${columnNames}) `
            + `VALUES ${paramsTemplate(columnNames)} `
            + `RETURNING id, ${columnNames}`;
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
