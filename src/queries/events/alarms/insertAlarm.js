const client = require('../../../infrastructure/database');
const errorMessage = require('../../_errorMessage');
const paramsTemplate = require('../../_paramsTemplate');
const columnNames = require('./_columnNames');

function insertAlarm(params) {
    return new Promise(function (resolve, reject) {
        const query = `INSERT INTO alarms (${columnNames}) `
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

module.exports = insertAlarm;
