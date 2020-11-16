const db = require('../../infrastructure/databasePromise');

async function deleteOriginalSubscription(params) {
    const query = 'DELETE FROM original_subscriptions WHERE subscription_id = $1';
    const result = await db.query(query, params);
    return result[0];
}

module.exports = deleteOriginalSubscription;
