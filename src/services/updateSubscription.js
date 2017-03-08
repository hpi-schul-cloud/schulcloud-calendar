const updateSubscriptionInDb = require('../queries/updateSubscription');
const deleteSubscription = require('../queries/deleteSubscription');

function updateSubscription(subscription, subscriptionId) {
    return new Promise((resolve, reject) => {
        const { icsUrl, description, scopeIds } = subscription;
        if (scopeIds.length !== 1) {
            reject('ScopeId needs to be unambiguous.');
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
