const getClient = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');

function insertOriginalSubscription(subscriptionId, scopeId) {
    return new Promise(function(resolve, reject) {
        const query = 'INSERT INTO original_subscriptions '
            + '(subscription_id, scope_id) '
            + 'VALUES ($1, $2) '
            + 'RETURNING subscription_id, scope_id';
        getClient().query(query, [subscriptionId, scopeId], function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows[0]);
            }
        });
    });
}

module.exports = insertOriginalSubscription;
