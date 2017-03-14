const updateRawEvents = require('../../queries/events/updateRawEvents');
const { updateColumns } = require('../../queries/events/constants');
const deleteAlarms = require('../../queries/events/alarms/deleteAlarms');
const insertAlarm = require('../../queries/events/alarms/insertAlarm');
const { columns: alarmColumns } = require('../../queries/events/alarms/constants');
const deleteExdates = require('../../queries/events/exdates/deleteExdates');
const insertExdate = require('../../queries/events/exdates/insertExdate');
const getScopeIdsForSeparateUsers = require('../scopes/getScopeIdsForSeparateUsers');
const compact = require('../../utils/compact');
const handleUndefinedEvents = require('./_handleUndefinedEvents');

function modifyEvents(event, eventId) {
    return new Promise((resolve, reject) => {
        const updateRoutine = (!event.scope_ids || event.scope_ids.length === 0)
            ? modifyAllEvents
            : modifyEventsWithScopeIds;

        updateRoutine(event, eventId)
            .then((updatedEvents) => {
                handleUndefinedEvents(updatedEvents, 'modification');
                return compact(updatedEvents);
            })
            .then((updatedEvents) => updateAlarms(updatedEvents, event))
            .then((updatedEvents) => updateExdates(updatedEvents, event))
            .then(resolve)
            .catch(reject);
    });
}

function modifyAllEvents(event, eventId) {
    return new Promise((resolve, reject) => {
        let params = updateColumns.map((column) => event[column]);
        params = [...params, eventId];
        updateRawEvents(params)
            .then(resolve)
            .catch(reject);
    });
}

function modifyEventsWithScopeIds(event, eventId) {
    const { scope_ids: scopeIds } = event;
    let allUpdatedEvents = [];
    return new Promise((resolve, reject) => {
        modifyEventsForScopeIds(scopeIds)
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
            const separateUsers = true;
            // if all or some scopeIds could not be found, split them up into
            // their user scopes and try again
            return getScopeIdsForSeparateUsers(unsuccessfulScopeIds, separateUsers);
        })
        .then((userScopeIds) => modifyEventsForScopeIds(userScopeIds))
        .then((moreUpdatedEvents) => {
            allUpdatedEvents = [...allUpdatedEvents, ...moreUpdatedEvents];
        })
        .then(() => resolve(allUpdatedEvents))
        .catch(reject);
    });

    function modifyEventsForScopeIds(scopeIds) {
        return new Promise((resolve, reject) => {
            Promise.all(scopeIds.map((scopeId) => {
                let params = updateColumns.map((column) => event[column]);
                params = [...params, eventId, scopeId];
                return updateRawEvents(params);
            })).then(resolve).catch(reject);
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
            const params = alarmColumns.reduce((params, column) => {
                if (column === 'id') return params;
                if (column === 'event_id') return [...params, eventId];
                return [...params, alarm[column]];
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

module.exports = modifyEvents;
