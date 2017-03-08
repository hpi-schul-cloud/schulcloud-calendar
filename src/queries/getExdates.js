const client = require('../infrastructure/database');
const errorMessage = require('./utils/errorMessage');

function getExdates(eventId) {
    return new Promise(function(resolve, reject) {
        const query = 'SELECT date FROM repetition_exception_dates WHERE event_id = $1';
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

module.exports = getExdates;
