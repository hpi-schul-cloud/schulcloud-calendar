const client = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');
const {
    allColumns,
    insertColumns,
    insertTemplate
} = require('./constants');

function insertEvent(params) {
    return new Promise(function (resolve, reject) {
        const query = `INSERT INTO events ${insertColumns} `
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

module.exports = insertEvent;
