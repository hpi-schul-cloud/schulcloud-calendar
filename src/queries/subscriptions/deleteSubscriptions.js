const db = require('../../infrastructure/databasePromise');
const { allColumns } = require('./constants');

async function deleteSubscriptions(subscriptionId, scopeId) {
    let params = [subscriptionId];
    let query = 'DELETE FROM subscriptions WHERE subscription_id = $1 ';
    if (scopeId) {
        params = [...params, scopeId];
        query += 'AND scope_id = $2 ';
    }
    query += `RETURNING ${allColumns}`;
    return db.query(query, params);
}

module.exports = deleteSubscriptions;
