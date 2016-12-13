const client = require('../models/database');

function insertEvent(params) {
    return new Promise(function(resolve, reject) {
        const query = 'INSERT INTO events (summary, location, description, start_timestamp, end_timestamp, reference_id, created_timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        client.query(query, params, function (error, result) {
            if (error) {
                console.error("Error processing " + query);
                console.error(error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = insertEvent;
