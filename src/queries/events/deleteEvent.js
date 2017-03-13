const client = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');
const { allColumns } = require('./constants');

function deleteEvent(params) {
    return new Promise(function(resolve, reject) {
        const query = 'DELETE FROM events '
            + 'WHERE event_id = $1 AND scope_id = $2 '
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

module.exports = deleteEvent;
