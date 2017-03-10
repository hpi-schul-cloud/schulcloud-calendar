const client = require('../infrastructure/database');
const errorMessage = require('./utils/errorMessage');

function insertSubscription(params) {
    return new Promise(function(resolve, reject) {
        const query = `INSERT INTO subscriptions (ics_url, description, scope_id)
            VALUES ($1, $2, $3) RETURNING *`;
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

module.exports = insertSubscription;
