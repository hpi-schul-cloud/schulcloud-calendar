const client = require('../models/database');

function deleteEvent(params) {
    return new Promise(function(resolve, reject) {
        const query = 'DELETE FROM events WHERE reference_id = $1';
        client.query(query, params, function (error, result) {
            if (error) {
                console.error("Error processing " + query);
                console.error(JSON.stringify(error));
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = deleteEvent;
