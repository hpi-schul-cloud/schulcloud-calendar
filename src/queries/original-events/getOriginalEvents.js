const client = require('../../infrastructure/database');
const errorMessage = require('../_errorMessage');

function getOriginalEvents(eventId) {
    return new Promise(function (resolve, reject) {
        const query = 'SELECT original_scope_id FROM eventid_originalscopeid WHERE event_id = $1';
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

module.exports = getOriginalEvents;
