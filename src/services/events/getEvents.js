const getAlarms = require('../../queries/events/alarms/getAlarms');
const getExdates = require('../../queries/events/exdates/getExdates');
const getRawEvents = require('../../queries/events/getRawEvents');
const flatten = require('../../utils/flatten');
const moveScopeIdToArray = require('../_moveScopeIdToArray');

function getEvents(filter, scopes) {
    return new Promise(function (resolve, reject) {
        if (filter.scopeId || filter.eventId) {
            completeEvents(filter)
                .then(resolve)
                .catch(reject);
        } else {
            eventsPerScope(scopes, filter)
                .then((events) => { resolve(flatten(events)); })
                .catch(reject);
        }
    });
}

function eventsPerScope(scopes, filter) {
    return new Promise((resolve, reject) => {
        Promise.all(Object.keys(scopes).map((scopeId) => {
            filter.scopeId = scopeId;
            return completeEvents(filter);
        })).then(resolve).catch(reject);
    });
}

function completeEvents(filter) {
    return new Promise((resolve, reject) => {
        getRawEvents(filter)
            .then(moveScopeIdToArray)
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
            getAlarms(event['id'])
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
            getExdates(event['id'])
                .then((exdates) => {
                    event.exdates = exdates;
                    if (index === events.length - 1) resolve(events);
                })
                .catch(reject);
        });
    });
}

module.exports = getEvents;
