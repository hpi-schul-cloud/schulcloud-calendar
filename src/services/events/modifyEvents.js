const updateEvent = require('../../queries/events/updateEvent');
const { updateColumns } = require('../../queries/events/constants');
const getScopeIdsForSeparateUsers = require('../scopes/getScopeIdsForSeparateUsers');
const compact = require('../../utils/compact');
const handleUndefinedEvents = require('./_handleUndefinedEvents');

function modifyEvents(event, eventId) {
    const { scope_ids, separate_users } = event;
    return new Promise((resolve, reject) => {
        getScopeIdsForSeparateUsers(scope_ids, separate_users)
            .then((scopeIds) => modifyEventsForScopeIds(event, eventId, scopeIds))
            .then(resolve)
            .catch(reject);
    });
}

function modifyEventsForScopeIds(event, eventId, scopeIds) {
    return new Promise((resolve, reject) => {
        // TODO alarms and exdates
        Promise.all(scopeIds.map((scopeId) => {
            let params = updateColumns.reduce((allParams, property) => {
                return [...allParams, event[property]];
            }, []);
            params = [...params, eventId, scopeId];
            return updateEvent(params);
        }))
            .then((updatedEvents) => {
                handleUndefinedEvents(updatedEvents, 'modification');
                resolve(compact(updatedEvents));
            })
            .catch(reject);
    });
}

module.exports = modifyEvents;
