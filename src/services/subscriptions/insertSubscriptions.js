const insertSubscriptionInDb = require('../../queries/subscriptions/insertSubscription');
const flatten = require('../../utils/flatten');
const getScopeIdsForSeparateUsers = require('../scopes/getScopeIdsForSeparateUsers');

function insertSubscriptions(subscriptions) {
    return new Promise((resolve, reject) => {
        Promise.all(subscriptions.map(insertSubscription))
            .then((insertedSubscriptions) => {
                resolve(flatten(insertedSubscriptions));
            })
            .catch(reject);
    });
}

function insertSubscription(subscription) {
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
                return insertSubscriptionInDb([ics_url, description, scopeId]);
            }));
        }
    });
}

module.exports = insertSubscriptions;
