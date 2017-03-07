const uuidV4 = require('uuid/v4');
const getScopeIdsForSeparateUsers = require('./getScopeIdsForSeparateUsers');
const insertRawEvent = require('../queries/insertRawEvent');
const insertExdate = require('../queries/insertExdate');
const insertAlarm = require('../queries/insertAlarm');
const insertOriginalScopeId = require('../queries/insertOriginalScopeId');

function storeEvents(events) {
    return new Promise((resolve, reject) => {
        // holds the eventId that is returned
        // (different to the internal and unique id)
        const externalEventIds = events.reduce((idMap, event) => {
            const eventId = event.uid;
            idMap[eventId] = idMap[eventId] || uuidV4();
            return idMap;
        }, {});

        Promise.all(events.map((event) => {
            return storeEvent(event, externalEventIds[event.uid]);
        })).then(resolve).catch(reject);

    });
}

function storeEvent(event, externalEventId) {
    return new Promise((resolve, reject) => {
        const { separateUsers, scopeIds } = event;
        getScopeIdsForSeparateUsers(scopeIds, separateUsers)
            .then((allScopeIds) => {
                return storeEventForScopes(event, allScopeIds, externalEventId);
            })
            .then((insertedEvents) => {
                return updateOriginalScopeIds(separateUsers, scopeIds, insertedEvents);
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
        if (!event.exdate) {
            return resolve(insertedEvent);
        }
        const exdates = event.exdate;
        const uniqueId = insertedEvent.id;
        Promise.all(exdates.map((exdate) => {
            return insertExdate([ uniqueId, exdate ]);
        })).then(() => { resolve(insertedEvent); }).catch(reject);
    });
}

function insertAlarms(event, insertedEvent) {
    return new Promise((resolve, reject) => {
        if (!event.alarm) {
            return resolve(insertedEvent);
        }
        const alarms = event.alarm;
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
        })).then(() => { resolve(insertedEvent); }).catch(reject);
    });
}

function updateOriginalScopeIds(separateUsers, scopeIds, insertedEvents) {
    return insertedEvents;
    // TODO insert right ids in eventid_originalreferenceid table
    // return new Promise((resolve, reject) => {
    //     if (!separateUsers) {
    //         resolve(insertedEvents);
    //     }
    //     const eventId = insertedEvents[0]['event_id'];
    //     Promise.all(scopeIds.map((scopeId) => {
    //         return insertOriginalScopeId(eventId, scopeId);
    //     })).then(() => { resolve(insertedEvents); }).catch(reject);
    // });
}

module.exports = storeEvents;
