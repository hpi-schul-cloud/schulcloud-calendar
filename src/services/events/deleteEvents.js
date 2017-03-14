const deleteEventsFromDb = require('../../queries/events/deleteEvents');
const getScopeIdsForSeparateUsers = require('../scopes/getScopeIdsForSeparateUsers');
const compact = require('../../utils/compact');
const handleUndefinedEvents = require('./_handleUndefinedEvents');

function deleteEvents(eventId, scopeIds) {
    return new Promise((resolve, reject) => {
        const deleteRoutine = (!scopeIds || scopeIds.length === 0)
            ? deleteAllEvents
            : deleteEventsWithScopeIds;
        deleteRoutine(eventId, scopeIds)
            .then((deletedEvents) => {
                handleUndefinedEvents(deletedEvents, 'deletion');
                resolve(compact(deletedEvents));
            })
            .then(resolve)
            .catch(reject);
    });
}

function deleteAllEvents(eventId) {
    return deleteEventsFromDb(eventId);
}

function deleteEventsWithScopeIds(eventId, scopeIds) {
    return new Promise((resolve, reject) => {
        let allDeletedEvents = [];
        deleteEventsForScopeIds(scopeIds)
            .then((deletedEvents) => {
                // add successfully deleted events to allDeletedEvents
                // collect scopeIds for which events were not found
                return deletedEvents.reduce((ids, event, index) => {
                    if (!event) {
                        return [...ids, scopeIds[index]];
                    } else {
                        allDeletedEvents = [...allDeletedEvents, event];
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
            .then((userScopeIds) => deleteEventsForScopeIds(userScopeIds))
            .then((moreDeletedEvents) => {
                allDeletedEvents = [...allDeletedEvents, ...moreDeletedEvents];
            })
            .then(() => resolve(allDeletedEvents))
            .catch(reject);
    });

    function deleteEventsForScopeIds(scopeIds) {
        return new Promise((resolve, reject) => {
            Promise.all(scopeIds.map((scopeId) => deleteEventsFromDb(eventId, scopeId)))
                .then((events) => {
                    // For easier handling, convert empty arrays (unsuccessful
                    // deletions) into undefined.
                    // If an event was deleted, the query result is an array with
                    // exactly one element since the scopeId is given.
                    resolve(events.map(([event]) => {
                        return event;
                    }));
                })
                .catch(reject);
        });
    }
}

module.exports = deleteEvents;
