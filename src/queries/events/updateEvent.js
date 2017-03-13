const client = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');
const {
    allColumns,
    updateColumns,
    updateTemplate
 } = require('./constants');

function udpdateEvent(params) {
    return new Promise(function(resolve, reject) {
        const lastButOneUpdateParam = updateColumns.length + 1;
        const lastUpdateParam = updateColumns.length + 2;
        const query = 'UPDATE events '
            + `SET ${updateTemplate} `
            + `WHERE event_id = $${lastButOneUpdateParam} `
            + `AND scope_id = $${lastUpdateParam}`
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

module.exports = udpdateEvent;
