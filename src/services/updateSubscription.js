const updateSubscriptionInDb = require('../queries/updateSubscription');
const deleteSubscription = require('../queries/deleteSubscription');

function updateSubscription(subscriptions, subscriptionId) {
    return new Promise((resolve, reject) => {
        // We only allow one subscription (belonging to the given id) to be edited
        if (subscriptions.length !== 1) {
            reject('Only one subscription allowed in request');
        }
        const subscription = subscriptions[0];
        const { icsUrl, description, scopeIds } = subscription;
        // Since per posted scopeId one subscription is returned, given the id
        // the scopeId id needs to be unambiguous
        if (scopeIds.length !== 1) {
            reject('Only one scopeId allowed in request');
        }
        const scopeId = scopeIds[0];
        deleteSubscription(subscriptionId)
            .then((deletedSubscription) => {
                if (deletedSubscription) {
                    const params = [subscriptionId, icsUrl, description, scopeId];
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
