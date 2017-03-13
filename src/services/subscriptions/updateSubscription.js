const updateSubscriptionInDb = require('../../queries/subscriptions/updateSubscription');
const deleteSubscription = require('../../queries/subscriptions/deleteSubscription');

function updateSubscription(subscriptions, subscriptionId) {
    return new Promise((resolve, reject) => {
        const subscription = subscriptions[0];
        const { ics_url, description, scope_ids } = subscription;

        const scopeId = scope_ids[0];
        deleteSubscription(subscriptionId)
            .then((deletedSubscription) => {
                if (deletedSubscription) {
                    const params = [subscriptionId, ics_url, description, scopeId];
                    return updateSubscriptionInDb(params);
                } else {
                    const error = new Error('Given subscriptionId not found');
                    error.status = 404;
                    error.title = 'Query Error';
                    reject(error);
                }
            })
            .then(resolve)
            .catch(reject);
    });
}

module.exports = updateSubscription;
