const insertSubscription = require('../queries/insertSubscription');
const getScopeIdsForSeparateUsers = require('../services/getScopeIdsForSeparateUsers');
const flatten = require('../utils/flatten');

function storeSubscriptions(subscriptions) {
    return new Promise((resolve, reject) => {
        Promise.all(subscriptions.map(storeSubscription))
            .then((insertedSubscriptions) => {
                resolve(flatten(insertedSubscriptions));
            })
            .catch(reject);
    });
}

function storeSubscription(subscription) {
    return new Promise((resolve, reject) => {
        const { icsUrl, description, scopeIds, separateUsers } = subscription;
        getScopeIdsForSeparateUsers(scopeIds, separateUsers)
            .then((scopeIds) => {
                return insertSubscriptions(scopeIds, icsUrl, description);
            })
            .then(resolve)
            .catch(reject);

        function insertSubscriptions(scopeIds, icsUrl, description) {
            return Promise.all(scopeIds.map((scopeId) => {
                return insertSubscription([icsUrl, description, scopeId]);
            }));
        }
    });
}

module.exports = storeSubscriptions;
