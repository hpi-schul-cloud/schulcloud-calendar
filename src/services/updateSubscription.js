const updateSubscriptionInDb = require('../queries/updateSubscription');
const deleteSubscription = require('../queries/deleteSubscription');

function updateSubscription(subscription, subscriptionId) {
    return new Promise((resolve, reject) => {
        const { icsUrl, description, scopeIds } = subscription;
        // since per posted scopeId one event is returned, given the id the
        // scopeId id needs to be unambiguous
        if (scopeIds.length !== 1) {
            reject('Only one scopeId allowed in request');
        }
        deleteSubscription(subscriptionId)
            .then(() => {
                const params = [subscriptionId, icsUrl, description, scopeIds[0]];
                return updateSubscriptionInDb(params);
            })
            .then(resolve)
            .catch(reject);
    });
}

module.exports = updateSubscription;
