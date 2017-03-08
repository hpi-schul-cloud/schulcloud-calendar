const client = require('../infrastructure/database');
const errorMessage = require('./utils/errorMessage');

function getSubscriptions(filter) {
    return new Promise((resolve, reject) => {
        if (noParamsGiven(filter)) {
            reject('No filter params for subscription selection given');
        }
        const { query, params } = buildQuery(filter);
        client.query(query, params, (error, result) => {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows);
            }
        });
    });
}

function buildQuery(filter) {
    const { scopeId, subscriptionId, lastUpdateFailed } = filter;
    let query = 'SELECT * FROM feeds WHERE';
    let params = [];
    let paramCount = 1;

    if (scopeId) {
        query = `${query} reference_id = $${paramCount}`;
        params = [ ...params, scopeId ];
        paramCount += 1;
    }

    if (subscriptionId) {
        query = paramCount > 1
            ? `${query} AND id = $${paramCount}`
            : `${query} id = $${paramCount}`;
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
        // the check when lastUpdateFailed is false fails intentionally since
        // we assume that it is not a useful query
        && !lastUpdateFailed;
}

module.exports = getSubscriptions;
