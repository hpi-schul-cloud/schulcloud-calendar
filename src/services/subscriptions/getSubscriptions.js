const flatten = require('../../utils/flatten');
const getSubscriptionsFromDb = require('../../queries/subscriptions/getSubscriptions');
const getScopeIdsForToken = require('../scopes/getScopeIdsForToken');

function getSubscriptions(filter, token) {
    return new Promise(function (resolve, reject) {
        if (filter.scopeId || filter.subscriptionId) {
            getSubscriptionsFromDb(filter)
                .then(resolve)
                .catch(reject);
        } else {
            getScopeIdsForToken(token)
                .then((scopeIds) => {
                    return subscriptionsPerScope(scopeIds, filter);
                })
                .then((subscriptions) => { resolve(flatten(subscriptions)); })
                .catch(reject);
        }
    });
}

function subscriptionsPerScope(scopeIds, filter) {
    return new Promise((resolve, reject) => {
        Promise.all(scopeIds.map((scopeId) => {
            filter.scopeId = scopeId;
            return getSubscriptionsFromDb(filter);
        })).then(resolve).catch(reject);
    });
}

module.exports = getSubscriptions;
