const db = require('../../infrastructure/databasePromise');

async function insertOriginalSubscription(subscriptionId, scopeId) {
    const query = 'INSERT INTO original_subscriptions '
        + '(subscription_id, scope_id) '
        + 'VALUES ($1, $2) '
        + 'RETURNING subscription_id, scope_id';
    const result = await db.query(query, [subscriptionId, scopeId]);
    return result[0];
}

module.exports = insertOriginalSubscription;
