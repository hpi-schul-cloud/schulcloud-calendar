const scopesForToken = require('../scopes/scopesForToken');
const flatten = require('../../utils/flatten');
const allAlarmsForEvent = require('../../queries/allAlarmsForEvent');
const getRepeatExceptionForEvent = require('../../queries/getRepeatExceptionForEvent');
const getRawEvents = require('../../queries/getRawEvents');

function getEvents(filter, token) {
    return new Promise(function (resolve, reject) {
        if (filter.scopeId || filter.eventId) {
            completeEvents(filter)
                .then(resolve)
                .catch(reject);
        } else {
            scopesForToken(token)
                .then((scopes) => { return eventsPerScope(scopes, filter); })
                .then((events) => { resolve(flatten(events)); })
                .catch(reject);
        }
    });
}

function eventsPerScope(scopes, filter) {
    return new Promise((resolve, reject) => {
        Promise.all(scopes.map(({id}) => {
            filter.scopeId = id;
            return completeEvents(filter);
        })).then(resolve).catch(reject);
    });
}

function completeEvents(filter) {
    return new Promise((resolve, reject) => {
        getRawEvents(filter)
            .then(appendAlarms)
            .then(appendExdates)
            .then(resolve)
            .catch(reject);
    });
}

function appendAlarms(events) {
    return new Promise((resolve, reject) => {
        if (events.length === 0) resolve(events);
        events.forEach((event, index) => {
            allAlarmsForEvent(event['id'])
                .then((alarms) => {
                    event.alarms = alarms;
                    if (index === events.length - 1) resolve(events);
                })
                .catch(reject);
        });
    });
}

function appendExdates(events) {
    return new Promise((resolve, reject) => {
        if (events.length === 0) resolve(events);
        events.forEach((event, index) => {
            getRepeatExceptionForEvent(event['id'])
                .then((exdates) => {
                    event.exdates = exdates;
                    if (index === events.length - 1) resolve(events);
                })
                .catch(reject);
        });
    });
}

module.exports = getEvents;
