const deleteSubscriptionsFromDb = require('../../queries/subscriptions/deleteSubscriptions');
const getScopeIdsForSeparateUsers = require('../scopes/getScopeIdsForSeparateUsers');
const compact = require('../../utils/compact');
const handleUndefinedSubscriptions = require('../_handleUndefinedObjects');

function deleteSubscriptions(subscriptionId, scopeIds) {
    return new Promise((resolve, reject) => {
        const deleteRoutine = (!scopeIds || scopeIds.length === 0)
            ? deleteAllSubscriptions
            : deleteSubscriptionsWithScopeIds;
        deleteRoutine(subscriptionId, scopeIds)
            .then((deletedSubscriptions) => {
                handleUndefinedSubscriptions(deletedSubscriptions, 'deletion', 'Subscription');
                resolve(compact(deletedSubscriptions));
            })
            .then(resolve)
            .catch(reject);
    });
}

function deleteAllSubscriptions(subscriptionId) {
    return deleteSubscriptionsFromDb(subscriptionId);
}

function deleteSubscriptionsWithScopeIds(subscriptionId, scopeIds) {
    return new Promise((resolve, reject) => {
        let allDeletedSubscriptions = [];
        deleteSubscriptionsForScopeIds(scopeIds)
            .then((deletedSubscriptions) => {
                // add successfully deleted subscriptions to allDeletedSubscriptions
                // collect scopeIds for which subscriptions were not found
                return deletedSubscriptions.reduce((ids, subscription, index) => {
                    if (!subscription) {
                        return [...ids, scopeIds[index]];
                    } else {
                        allDeletedSubscriptions = [...allDeletedSubscriptions, subscription];
                        return [...ids];
                    }
                }, []);
            })
            .then((unsuccessfulScopeIds) => {
                // if all or some scopeIds could not be found, split them up into
                // their user scopes and try again
                const separateUsers = true;
                return getScopeIdsForSeparateUsers(unsuccessfulScopeIds, separateUsers);
            })
            .then((userScopeIds) => {
                // we don't want to do the same query twice
                return userScopeIds.reduce((newScopeIds, scopeId) => {
                    return scopeIds.includes(scopeId)
                        ? newScopeIds
                        : [...newScopeIds, scopeId];
                }, []);
            })
            .then((userScopeIds) => deleteSubscriptionsForScopeIds(userScopeIds))
            .then((moreDeletedSubscriptions) => {
                allDeletedSubscriptions = [...allDeletedSubscriptions, ...moreDeletedSubscriptions];
            })
            .then(() => resolve(allDeletedSubscriptions))
            .catch(reject);
    });

    function deleteSubscriptionsForScopeIds(scopeIds) {
        return new Promise((resolve, reject) => {
            Promise.all(scopeIds.map((scopeId) => deleteSubscriptionsFromDb(subscriptionId, scopeId)))
                .then((subscriptions) => {
                    // For easier handling, convert empty arrays (unsuccessful
                    // deletions) into undefined.
                    // If a subscription was deleted, the query result is an array with
                    // exactly one element since the scopeId is given.
                    resolve(subscriptions.map(([subscription]) => {
                        return subscription;
                    }));
                })
                .catch(reject);
        });
    }
}

module.exports = deleteSubscriptions;
