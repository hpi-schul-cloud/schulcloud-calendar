const client = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');
const {
    allColumns,
    updateColumns,
    updateTemplate,
 } = require('./constants');

function udpdateSubscription(params) {
    return new Promise(function(resolve, reject) {
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

        client.query(query, params, function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
				if(result.rows.length<=0){
					console.error('No query target found!');
					errorMessage(query, error);
					reject(error)
				}		
				else						
					resolve(result.rows);
            }
        });
    });
}

module.exports = udpdateSubscription;
