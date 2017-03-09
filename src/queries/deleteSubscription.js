const client = require('../infrastructure/database');
const errorMessage = require('./utils/errorMessage');

function deleteSubscription(subscriptionId) {
    return new Promise(function(resolve, reject) {
        const query = 'DELETE FROM feeds WHERE id = $1 RETURNING *';
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
