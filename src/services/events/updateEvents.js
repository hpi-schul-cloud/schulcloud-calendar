const updateRawEvents = require('../../queries/events/updateRawEvents');
const { updateColumns } = require('../../queries/events/constants');

const deleteAlarms = require('../../queries/events/alarms/deleteAlarms');
const insertAlarm = require('../../queries/events/alarms/insertAlarm');
const { columns: alarmColumns } = require('../../queries/events/alarms/constants');

const deleteExdates = require('../../queries/events/exdates/deleteExdates');
const insertExdate = require('../../queries/events/exdates/insertExdate');

const updateOriginalEvent = require('../../queries/original-events/updateOriginalEvent');

const getScopeIdsForSeparateUsers = require('../scopes/getScopeIdsForSeparateUsers');
const handleUndefinedEvents = require('../_handleUndefinedObjects');
const moveScopeIdToArray = require('../_moveScopeIdToArray');
const compact = require('../../utils/compact');

const getOriginalEvent = require('./getOriginalEvent');

function updateEvents(event, eventId) {
    return new Promise((resolve, reject) => {
        const updateRoutine = (!event.scope_ids || event.scope_ids.length === 0)
            ? updateAllEvents
            : updateEventsWithScopeIds;

        updateRoutine(event, eventId)
            .then((updatedEvents) => {
                handleUndefinedEvents(updatedEvents, 'modification', 'Event');
                return compact(updatedEvents);
            })
            .then(moveScopeIdToArray)
            .then((updatedEvents) => updateAlarms(updatedEvents, event))
            .then((updatedEvents) => updateExdates(updatedEvents, event))
            .then(resolve)
            .catch(reject);
    });
}

function updateAllEvents(event, eventId) {
    return new Promise((resolve, reject) => {
        let params = updateColumns.map((columnName) => event[columnName]);
        params = [...params, eventId];
        updateRawEvents(params)
            .then(updatedEvents => {
                updateOriginalEvent([eventId, getOriginalEvent(updatedEvents[0])]);
                return updatedEvents;
            })
            .then(resolve)
            .catch(reject);
    });
}

function updateEventsWithScopeIds(event, eventId) {
    return new Promise((resolve, reject) => {
        const { scope_ids: scopeIds } = event;
        let allUpdatedEvents = [];
        updateEventsForScopeIds(scopeIds)
        // Updating the the events might lead to an inconsistent db state (with different events and the same event_id),
        // please see wiki/future-work.md for more details. Therefore, we do not change the original event here.
            .then((updatedEvents) => {
                // add successfully updated events to allUpdatedEvents
                // collect scopeIds for which events were not found
                return updatedEvents.reduce((ids, event, index) => {
                    if (!event) {
                        return [...ids, scopeIds[index]];
                    } else {
                        allUpdatedEvents = [...allUpdatedEvents, event];
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
            .then((userScopeIds) => updateEventsForScopeIds(userScopeIds))
            .then((moreUpdatedEvents) => {
                allUpdatedEvents = [...allUpdatedEvents, ...moreUpdatedEvents];
            })
            .then(() => resolve(allUpdatedEvents))
            .catch(reject);
    });

    function updateEventsForScopeIds(scopeIds) {
        return new Promise((resolve, reject) => {
            Promise.all(scopeIds.map((scopeId) => {
                let params = updateColumns.map((columnName) => event[columnName]);
                params = [...params, eventId, scopeId];
                return updateRawEvents(params);
            }))
            .then((events) => {
                // For easier handling, convert empty arrays (unsuccessful
                // updates) into undefined.
                // If an event was updated, the query result is an array with
                // exactly one element since the scopeId is given.
                resolve(events.map(([event]) => {
                    return event;
                }));
            })
            .catch(reject);
        });
    }
}

function updateAlarms(updatedEvents, event) {
    return new Promise((resolve, reject) => {
        const { alarms } = event;
        Promise.all(updatedEvents.map((updatedEvent) => {
            const eventId = updatedEvent.id;
            // alarms are simply overwritten, we assume that an id change is
            // not that bad
            return deleteAlarms(eventId)
                .then(() => {
                    if (alarms) return insertAlarms(alarms, eventId);
                })
                .then((insertedAlarms) => {
                    updatedEvent.alarms = insertedAlarms;
                    return updatedEvent;
                })
                .catch(reject);
        })).then(() => resolve(updatedEvents)).catch(reject);
    });
}

function insertAlarms(alarms, eventId) {
    return new Promise((resolve, reject) => {
        Promise.all(alarms.map((alarm) => {
            const params = alarmColumns.reduce((params, columnName) => {
                if (columnName === 'id') return params;
                if (columnName === 'event_id') return [...params, eventId];
                return [...params, alarm[columnName]];
            }, []);
            return insertAlarm(params);
        })).then(resolve).catch(reject);
    });
}

function updateExdates(updatedEvents, event) {
    return new Promise((resolve, reject) => {
        const { exdates } = event;
        Promise.all(updatedEvents.map((updatedEvent) => {
            const eventId = updatedEvent.id;
            // exdates are simply overwritten, we assume that an id change is
            // not that bad
            return deleteExdates(eventId)
                .then(() => {
                    if (exdates) return insertExdates(exdates, eventId);
                })
                .then((insertedExdates) => {
                    updatedEvent.exdates = insertedExdates;
                    return updatedEvent;
                })
                .catch(reject);
        })).then(() => resolve(updatedEvents)).catch(reject);
    });
}

function insertExdates(exdates, eventId) {
    return new Promise((resolve, reject) => {
        Promise.all(exdates.map((exdate) => {
            return insertExdate([eventId, exdate]);
        })).then(resolve).catch(reject);
    });
}

module.exports = updateEvents;
