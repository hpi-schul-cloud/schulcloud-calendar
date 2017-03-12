const client = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');
const {
    allColumns,
    updateTemplate,
    lastUpdateParam
 } = require('./constants');

function udpdateSubscription(params) {
    return new Promise(function(resolve, reject) {
        const query = 'UPDATE subscriptions '
            + `SET ${updateTemplate} `
            + `WHERE id = $${lastUpdateParam} `
            + `RETURNING ${allColumns}`;
        client.query(query, params, function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows[0]);
            }
        });
    });
}

module.exports = udpdateSubscription;
