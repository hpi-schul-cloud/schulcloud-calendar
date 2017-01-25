const client = require('../models/database');

function insertFeedSubscription(params) {
    return new Promise(function(resolve, reject) {
        const query = 'INSERT INTO feeds (ics_url, description, reference_ids, separate_users) VALUES ($1, $2, $3, $4) RETURNING id';
        client.query(query, params, function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows[0]);
            }
        });
    });
}

module.exports = insertFeedSubscription;
