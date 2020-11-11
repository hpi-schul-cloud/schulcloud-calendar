const db = require('../../infrastructure/databasePromise');

function getOriginalSubscription(param) {
    const query = 'SELECT subscription_id, scope_id FROM original_subscriptions WHERE subscription_id = $1';
    return db.query(query, [ param ]);
}

module.exports = getOriginalSubscription;
