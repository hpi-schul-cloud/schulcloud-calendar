const uuidV4 = require('uuid/v4');
const insertRawEvent = require('../../queries/events/insertRawEvent');
const insertExdate = require('../../queries/events/exdates/insertExdate');
const insertAlarm = require('../../queries/events/alarms/insertAlarm');
const insertOriginalScopeId = require('../../queries/original-events/insertOriginalEvent');
const flatten = require('../../utils/flatten');
const getScopeIdsForSeparateUsers = require('../scopes/getScopeIdsForSeparateUsers');

function storeEvents(events) {
    return new Promise((resolve, reject) => {
        Promise.all(events.map((event) => {
            return storeEvent(event);
        })).then((events) => resolve(flatten(events))).catch(reject);

    });
}

function storeEvent(event) {
    return new Promise((resolve, reject) => {
        const {separate_users, scope_ids} = event;
        // the eventId that is returned (different to the internal, unique id)
        const eventId = uuidV4();
        getScopeIdsForSeparateUsers(scope_ids, separate_users)
            .then((allScopeIds) => {
                return storeEventForScopes(event, allScopeIds, eventId);
            })
            .then((insertedEvents) => {
                return updateOriginalScopeIds(separate_users, scope_ids, insertedEvents);
            })
            .then(resolve)
            .catch(reject);
    });
}

function storeEventForScopes(event, scopeIds, externalEventId) {
    return new Promise((resolve, reject) => {
        Promise.all(scopeIds.map((scopeId) => {
            return storeEventPerScope(event, scopeId, externalEventId);
        })).then(resolve).catch(reject);
    });
}

function storeEventPerScope(event, scopeId, externalEventId) {
    return new Promise((resolve, reject) => {
        const params = [
            event['summary'],
            event['location'],
            event['description'],
            event['dtstart'],
            event['dtend'],
            scopeId,
            event['dtstamp'],
            event['repeat_freq'],
            event['repeat_until'],
            event['repeat_count'],
            event['repeat_interval'],
            event['repeat_bysecond'],
            event['repeat_byminute'],
            event['repeat_byhour'],
            event['repeat_byday'],
            event['repeat_bymonthday'],
            event['repeat_byyearday'],
            event['repeat_byweekno'],
            event['repeat_bymonth'],
            event['repeat_bysetpos'],
            event['repeat_wkst'],
            externalEventId
        ];
        insertRawEvent(params)
            .then((insertedEvent) => {
                return insertExdates(event, insertedEvent);
            })
            .then((insertedEvent) => {
                return insertAlarms(event, insertedEvent);
            })
            .then(resolve)
            .catch(reject);
    });
}

function insertExdates(event, insertedEvent) {
    return new Promise((resolve, reject) => {
        // check if exception dates for possible repeat exists
        // TODO: if so, check if repeat is set because of consistency reasons...
        if (!event.exdates) {
            return resolve(insertedEvent);
        }
        const exdates = event.exdates;
        const uniqueId = insertedEvent.id;
        Promise.all(exdates.map((exdate) => {
            return insertExdate([uniqueId, exdate]);
        })).then((insertedExdates) => {
            insertedEvent.exdates = insertedExdates;
            resolve(insertedEvent);
        }).catch(reject);
    });
}

function insertAlarms(event, insertedEvent) {
    return new Promise((resolve, reject) => {
        if (!event.alarms) {
            return resolve(insertedEvent);
        }
        const alarms = event.alarms;
        const uniqueId = insertedEvent.id;
        Promise.all(alarms.map((alarm) => {
            const params = [
                uniqueId,
                alarm['trigger'],
                alarm['repeat'],
                alarm['duration'],
                alarm['action'],
                alarm['attach'],
                alarm['description'],
                alarm['attendee'],
                alarm['summary'],
            ];
            return insertAlarm(params);
        })).then((insertedAlarms) => {
            insertedEvent.alarms = insertedAlarms;
            resolve(insertedEvent);
        }).catch(reject);
    });
}

function updateOriginalScopeIds(separateUsers, scopeIds, insertedEvents) {
    return new Promise((resolve, reject) => {
        if (!separateUsers || insertedEvents.length === 0) {
            return resolve(insertedEvents);
        }
        const eventId = insertedEvents[0]['event_id'];
        Promise.all(scopeIds.map((scopeId) => {
            return insertOriginalScopeId(eventId, scopeId);
        })).then(() => { resolve(insertedEvents); }).catch(reject);
    });
}

module.exports = storeEvents;
