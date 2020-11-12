const db = require('../../infrastructure/databasePromise');
const { allColumns } = require('./constants');

function getSubscriptions(filter) {
    if (noParamsGiven(filter)) {
        reject('No filter params for subscription selection given');
    }
    const { query, params } = buildQuery(filter);
    return db.query(query, params);
}

function buildQuery(filter) {
    const { scopeId, subscriptionId, lastUpdateFailed } = filter;
    let query = `SELECT ${allColumns} FROM subscriptions WHERE`;
    let params = [];
    let paramCount = 1;

    if (scopeId) {
        query = `${query} scope_id = $${paramCount}`;
        params = [ ...params, scopeId ];
        paramCount += 1;
    }

    if (subscriptionId) {
        query = paramCount > 1
            ? `${query} AND subscription_id = $${paramCount}`
            : `${query} subscription_id = $${paramCount}`;
        params = [ ...params, subscriptionId ];
        paramCount += 1;
    }

    if (lastUpdateFailed) {
        const updateFailedCode = 500;
        query = paramCount > 1
            ? `${query} AND last_updated_status = $${paramCount}`
            : `${query} last_updated_status = $${paramCount}`;
        params = [ ...params, updateFailedCode ];
        paramCount += 1;
    }

    query = `${query} ORDER BY id ASC;`;
    return { query, params };
}

function noParamsGiven(filter) {
    const { scopeId, subscriptionId, lastUpdateFailed } = filter;
    return !scopeId
        && !subscriptionId
        // Actually we should check for undefined here since lastUpdateFailed
        // is a boolean. However, we don't assume a query valid where only
        // lastUpdateFailed is set to false.
        && !lastUpdateFailed;
}

module.exports = getSubscriptions;
