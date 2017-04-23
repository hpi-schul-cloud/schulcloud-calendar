const flatten = require('../../utils/flatten');
const getSubscriptionsFromDb = require('../../queries/subscriptions/getSubscriptions');
const getScopeIdsForToken = require('../scopes/getScopeIdsForToken');
const moveScopeIdToArray = require('../_moveScopeIdToArray');

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
            return completeSubscriptions(filter);
        })).then(resolve).catch(reject);
    });
}

function completeSubscriptions(filter) {
    return new Promise((resolve, reject) => {
        getSubscriptionsFromDb(filter)
            .then(moveScopeIdToArray)
            .then(resolve)
            .catch(reject);
    });
}

module.exports = getSubscriptions;
