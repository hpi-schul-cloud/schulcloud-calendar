const client = require('../infrastructure/database');
const errorMessage = require('./utils/errorMessage');

function allEvents(referenceId) {
    return new Promise(function(resolve, reject) {
        const query = 'SELECT * FROM events WHERE reference_id = $1 ORDER BY id ASC;';
        client.query(query,[referenceId], function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = allEvents;
