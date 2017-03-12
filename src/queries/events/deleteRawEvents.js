const client = require('../../infrastructure/database');
const errorMessage = require('../_errorMessage');

function deleteEvents(eventId) {
    return new Promise(function(resolve, reject) {
        const query = 'DELETE FROM events WHERE event_id = $1 RETURNING *';
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

module.exports = deleteEvents;
