const client = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');

function deleteOriginalSubscription(params) {
    return new Promise(function (resolve, reject) {
        const query = 'DELETE FROM original_subscriptions WHERE subscription_id = $1';
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

module.exports = deleteOriginalSubscription;
