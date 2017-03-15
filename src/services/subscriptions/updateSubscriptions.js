const updateSubscriptionsInDb = require('../../queries/subscriptions/updateSubscriptions');
const { updateColumns } = require('../../queries/subscriptions/constants');
const getScopeIdsForSeparateUsers = require('../scopes/getScopeIdsForSeparateUsers');
const compact = require('../../utils/compact');
const handleUndefinedSubscriptions = require('../_handleUndefinedObjects');

function updateSubscriptions(subscription, subscriptionId) {
    return new Promise((resolve, reject) => {
        const { scope_ids: scopeIds } = subscription;
        const updateRoutine = (!scopeIds || scopeIds.length === 0)
            ? updateAllSubscriptions
            : updateSubscriptionsWithScopeIds;
        updateRoutine(subscription, subscriptionId, scopeIds)
            .then((updatedSubscriptions) => {
                handleUndefinedSubscriptions(updatedSubscriptions, 'deletion', 'Subscription');
                resolve(compact(updatedSubscriptions));
            })
            .then(resolve)
            .catch(reject);
    });
}

function updateAllSubscriptions(subscription, subscriptionId) {
    let params = updateColumns.map((columnName) => subscription[columnName]);
    params = [...params, subscriptionId];
    return updateSubscriptionsInDb(params);
}

function updateSubscriptionsWithScopeIds(subscription, subscriptionId, scopeIds) {
    return new Promise((resolve, reject) => {
        let allUpdatedSubscriptions = [];
        updateSubscriptionsForScopeIds(subscription, subscriptionId, scopeIds)
            .then((updatedSubscriptions) => {
                // add successfully updated subscriptions to allUpdatedSubscriptions
                // collect scopeIds for which subscriptions were not found
                return updatedSubscriptions.reduce((ids, subscription, index) => {
                    if (!subscription) {
                        return [...ids, scopeIds[index]];
                    } else {
                        allUpdatedSubscriptions = [...allUpdatedSubscriptions, subscription];
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
            .then((userScopeIds) => updateSubscriptionsForScopeIds(subscription, subscriptionId, userScopeIds))
            .then((moreUpdatedSubscriptions) => {
                allUpdatedSubscriptions = [...allUpdatedSubscriptions, ...moreUpdatedSubscriptions];
            })
            .then(() => resolve(allUpdatedSubscriptions))
            .catch(reject);
    });

    function updateSubscriptionsForScopeIds(subscriptions, subscriptionId, scopeIds) {
        return new Promise((resolve, reject) => {
            Promise.all(scopeIds.map((scopeId) => {
                let params = updateColumns.map((columnName) => subscription[columnName]);
                params = [...params, subscriptionId, scopeId];
                return updateSubscriptionsInDb(params);
            }))
                .then((subscriptions) => {
                    // For easier handling, convert empty arrays (unsuccessful
                    // deletions) into undefined.
                    // If a subscription was updated, the query result is an array with
                    // exactly one element since the scopeId is given.
                    resolve(subscriptions.map(([subscription]) => {
                        return subscription;
                    }));
                })
                .catch(reject);
        });
    }
}

module.exports = updateSubscriptions;
