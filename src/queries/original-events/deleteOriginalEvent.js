const getClient = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');

function deleteOriginalEvent(params) {
    return new Promise(function (resolve, reject) {
        const query = 'DELETE FROM original_events WHERE event_id = $1';
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

module.exports = deleteOriginalEvent;
