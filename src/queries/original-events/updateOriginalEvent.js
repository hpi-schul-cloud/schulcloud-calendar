const getClient = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');

function updateOriginalEvent(params) {
    return new Promise(function (resolve, reject) {
        const query = 'UPDATE original_events SET original_event = $2 WHERE event_id = $1';
        getClient().query(query, params, function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows[0]);
            }
        });
    });
}

module.exports = updateOriginalEvent;
