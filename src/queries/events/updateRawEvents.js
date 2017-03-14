const client = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');
const {
    allColumns,
    updateColumns,
    updateTemplate
 } = require('./constants');

function udpdateRawEvent(params) {
    return new Promise(function(resolve, reject) {
        const eventIdIndex = updateColumns.length + 1;
        const scopeIdIndex = updateColumns.length + 2;
        let query = 'UPDATE events '
            + `SET ${updateTemplate} `
            + `WHERE event_id = $${eventIdIndex} `;
        // scopeId in params
        if (params.length === updateColumns.length + 2) {
            query += `AND scope_id = $${scopeIdIndex} `;
        }
        query += `RETURNING ${allColumns}`;
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

module.exports = udpdateRawEvent;
