const db = require('../../infrastructure/databasePromise');

async function insertOriginalSubscription(subscriptionId, scopeId) {
    const query = 'INSERT INTO original_subscriptions '
        + '(subscription_id, scope_id) '
        + 'VALUES ($1, $2) '
        + 'RETURNING subscription_id, scope_id';
    return db.query(query, [subscriptionId, scopeId]);
}

module.exports = insertOriginalSubscription;
