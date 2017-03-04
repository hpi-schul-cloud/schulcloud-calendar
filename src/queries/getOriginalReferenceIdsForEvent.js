const client = require('../infrastructure/database');
const errorMessage = require('./utils/errorMessage');

function getOriginalReferenceIdsForEvent(eventId) {
    return new Promise(function (resolve, reject) {
        const query = 'SELECT original_reference_id FROM eventid_originalreferenceid WHERE event_id = $1';
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

module.exports = getOriginalReferenceIdsForEvent;
