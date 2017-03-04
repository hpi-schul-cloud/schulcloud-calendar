const client = require('../infrastructure/database');
const errorMessage = require('./utils/errorMessage');

function addRepeatExceptionToEvent(params) {
    return new Promise(function(resolve, reject) {
        // TODO: check if event exists
        // TODO: check if exception exists already
        const query = 'INSERT INTO repetition_exception_dates (event_id, date) VALUES ($1, $2)';
        client.query(query, params, function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = addRepeatExceptionToEvent;