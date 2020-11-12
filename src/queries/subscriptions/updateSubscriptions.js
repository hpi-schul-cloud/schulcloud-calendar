const db = require('../../infrastructure/databasePromise');
const {
    allColumns,
    updateColumns,
    updateTemplate,
 } = require('./constants');

async function udpdateSubscription(params) {
    const subscriptionIdIndex = updateColumns.length + 1;
    const scopeIdIndex = updateColumns.length + 2;
    let query = 'UPDATE subscriptions '
        + `SET ${updateTemplate} `
        + `WHERE subscription_id = $${subscriptionIdIndex} `;
    // scopeId in params
    if (params.length === updateColumns.length + 2) {
        query += `AND scope_id = $${scopeIdIndex} `;
    }
    query += `RETURNING ${allColumns}`;
    return db.query(query, params);
}

module.exports = udpdateSubscription;
