const client = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');
const { allColumns } = require('./constants');

function getSubscriptions(filter,getAll=false) {

	return new Promise((resolve, reject) => {
        if ( !getAll && noParamsGiven(filter)) {
            reject('No filter params for subscription selection given');
        }
        const { query, params } = buildQuery(filter,getAll);
        client.query(query, params, (error, result) => {
            if (error) {
                errorMessage(query, error);
                reject(error);
            }else{
				resolve(result.rows);
			}
        });
    });
}

function buildQuery(filter,getAll) {
    const { scopeId, subscriptionId, lastUpdateFailed } = filter; /*$limit, $offset */
    let query = `SELECT ${allColumns} FROM subscriptions WHERE`;
    let params = [];
    let paramCount = 1;
	
	if( getAll ){
		query = query.replace(' WHERE',';');
		console.log('query=',query);
		return { query, params }
	}

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

    query = `${query} ORDER BY description ASC;`;		//later per sql request
	
	/*if($limit && $limit>=1){
		query = `${query} LIMIT $${paramCount}`;
		params = [ ...params, ($limit-1) ];
		paramCount += 1;
	} 
	
	if($offset && $offset>=0){
		query = `${query} OFFSET $${paramCount}`;
		params = [ ...params, $offset ];
		paramCount += 1;
	}
	
	query = `${query};`;*/
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
