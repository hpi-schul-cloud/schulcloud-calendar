const client = require('../models/database');

function allEventsForReferenceId(referenceId) {
    return new Promise(function(resolve, reject) {
        const query = 'SELECT * FROM events WHERE reference_id = $1 ORDER BY id ASC;';
        client.query(query,[referenceId], function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = allEventsForReferenceId;
