const client = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');
const { allColumns } = require('./constants');

function deleteSubscription(subscriptionId) {
    return new Promise(function(resolve, reject) {
        const query = 'DELETE FROM subscriptions WHERE id = $1 '
            + `RETURNING ${allColumns}`;
        client.query(query, [subscriptionId], function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows[0]);
            }
        });
    });
}

module.exports = deleteSubscription;
