const { v4: uuidV4 } = require('uuid');
const insertSubscriptionInDb = require('../../queries/subscriptions/insertSubscription');
const insertOriginalSubscription = require('../../queries/subscriptions/insertOriginalSubscription');
const getScopeIdsForSeparateUsers = require('../getScopeIdsForSeparateUsers');
const flatten = require('../../utils/flatten');
const moveScopeIdToArray = require('../_moveScopeIdToArray');

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
        const subscriptionId = uuidV4();
        getScopeIdsForSeparateUsers(scope_ids, separate_users)
            .then((scopeIds) => {
                return insertSubscriptions(scopeIds, ics_url, description, subscriptionId);
            })
            .then(moveScopeIdToArray)
            .then((insertedSubscriptions) => insertOriginalSubscriptions(scope_ids, insertedSubscriptions))
            .then(resolve)
            .catch(reject);

        function insertSubscriptions(scope_ids, ics_url, description, subscriptionId) {
            return Promise.all(scope_ids.map((scopeId) => {
                return insertSubscriptionInDb([ics_url, description, scopeId, subscriptionId]);
            }));
        }
    });
}

function insertOriginalSubscriptions(scopeIds, insertedSubscriptions) {
    return new Promise((resolve, reject) => {
        // all subscriptions here should have the same core params so we can
        // just take the first one
        const subscriptionId = insertedSubscriptions[0]['subscription_id'];
        Promise.all(scopeIds.map((scopeId) => {
            return insertOriginalSubscription(subscriptionId, scopeId);
        })).then(() => resolve(insertedSubscriptions)).catch(reject);
    });
}

module.exports = insertSubscriptions;
