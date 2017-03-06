const client = require('../infrastructure/database');
const errorMessage = require('./utils/errorMessage');

function deleteEvent(eventId) {
    return new Promise(function(resolve, reject) {
        const query = `DELETE FROM events WHERE event_id = '${eventId}'`;
        client.query(query, function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = deleteEvent;
