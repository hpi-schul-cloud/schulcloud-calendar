const client = require('../infrastructure/database');
const errorMessage = require('./utils/errorMessage');

// NOTE: delete needs to be called before, otherwise the id won't be unique anymore
function udpdateSubscription(params) {
    return new Promise(function(resolve, reject) {
        const query = `INSERT INTO subscriptions (id, ics_url, description, scope_id)
            VALUES ($1, $2, $3, $4) RETURNING *`;
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

module.exports = udpdateSubscription;
