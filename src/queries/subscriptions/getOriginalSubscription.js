const client = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');
const { allColumns } = require('./constants');

function getOriginalSubscription(param) {
    return new Promise(function (resolve, reject) {
        const query = `SELECT subscription_id, scope_id FROM original_subscriptions WHERE subscription_id = $1`;
        client.query(query, [ param ], function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows);
            }
        });
    });
}

module.exports = getOriginalSubscription;
