const deleteEvent = require('../../queries/events/deleteEvent');
const getScopeIdsForSeparateUsers = require('../scopes/getScopeIdsForSeparateUsers');
const compact = require('../../utils/compact');
const handleUndefinedEvents = require('./_handleUndefinedEvents');

function deleteEvents(eventId, scopeIds, separateUsers) {
    return new Promise((resolve, reject) => {
        getScopeIdsForSeparateUsers(scopeIds, separateUsers)
            .then((scopeIds) => deleteEventsForScopeIds(eventId, scopeIds))
            .then(resolve)
            .catch(reject);
    });
}

function deleteEventsForScopeIds(eventId, scopeIds) {
    return new Promise((resolve, reject) => {
        Promise.all(scopeIds.map((scopeId) => deleteEvent([eventId, scopeId])))
            .then((deletedEvents) => {
                handleUndefinedEvents(deletedEvents, 'deletion');
                resolve(compact(deletedEvents));
            })
            .catch(reject);
    });
}

module.exports = deleteEvents;
