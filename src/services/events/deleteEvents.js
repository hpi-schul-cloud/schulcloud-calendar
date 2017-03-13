const deleteEvent = require('../../queries/events/deleteEvent');
const getScopeIdsForSeparateUsers = require('../scopes/getScopeIdsForSeparateUsers');
const compact = require('../../utils/compact');
const logger = require('../../infrastructure/logger');

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
                handleUndefinedEvents(deletedEvents);
                deletedEvents = compact(deletedEvents);
                resolve(deletedEvents);
            })
            .catch(reject);
    });
}

function handleUndefinedEvents(deletedEvents) {
    const undefinedEvents = deletedEvents.filter((event) => {
        return typeof event === 'undefined';
    });
    const isIncompleteDeletion = (undefinedEvents.length > 0)
        && (undefinedEvents.length !== deletedEvents.length);
    if (isIncompleteDeletion) {
        const warning = `Only ${deletedEvents.length - undefinedEvents.length} `
            + `out of ${deletedEvents.length} scope-ids found for event deletion`
        logger.warn(warning);
    }
}

module.exports = deleteEvents;
