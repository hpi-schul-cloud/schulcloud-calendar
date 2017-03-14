const client = require('../../../infrastructure/database');
const errorMessage = require('../../utils/errorMessage');
const { allColumns } = require('./constants');

function deleteAlarms(eventId) {
    return new Promise(function (resolve, reject) {
        const query = 'DELETE FROM exdates '
            + 'WHERE event_id = $1 '
            + `RETURNING ${allColumns}`;
        client.query(query, [eventId], function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows);
            }
        });
    });
}

module.exports = deleteAlarms;
