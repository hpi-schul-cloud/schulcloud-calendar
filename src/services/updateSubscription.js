const updateSubscriptionInDb = require('../queries/updateSubscription');
const deleteSubscription = require('../queries/deleteSubscription');

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
                    const error = 'Given subscriptionId not found';
                    const status = 404;
                    const title = 'Query Error';
                    reject({error, status, title});
                }
            })
            .then(resolve)
            .catch(reject);
    });
}

module.exports = updateSubscription;
