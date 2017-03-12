const insertSubscription = require('../../queries/insertSubscription');
const flatten = require('../../utils/flatten');
const getScopeIdsForSeparateUsers = require('../scopes/getScopeIdsForSeparateUsers');

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
        const { ics_url, description, scope_ids, separate_users } = subscription;
        getScopeIdsForSeparateUsers(scope_ids, separate_users)
            .then((scopeIds) => {
                return insertSubscriptions(scopeIds, ics_url, description);
            })
            .then(resolve)
            .catch(reject);

        function insertSubscriptions(scope_ids, ics_url, description) {
            return Promise.all(scope_ids.map((scopeId) => {
                return insertSubscription([ics_url, description, scopeId]);
            }));
        }
    });
}

module.exports = storeSubscriptions;
