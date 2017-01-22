const getRepeatExceptionsIcsForEvent = require('../../queries/getRepeatExceptionForEvent').getRepeatExceptionsIcsForEvent;
const queryToEventIcs = require('../../parsers/queryToEventIcs');
const getAlarmsIcsForEvent = require('../../queries/allAlarmsForEvent').getAlarmsIcsForEvent;


function catchEventDetailsAndCreateIcs(event) {
    return new Promise(function (resolve, reject) {
        const exdates = {};
        const alarms = {};
        const eventPromises = [];
        eventPromises.push(catchExdates(event, exdates));
        eventPromises.push(catchAlarms(event, alarms));
        Promise.all(eventPromises).then(
            createEventIcs.bind(null, event, exdates, alarms, resolve),
            reject.bind(null)
        );
    });
}

module.exports = catchEventDetailsAndCreateIcs;


function createEventIcs(event, exdates, alarms, resolve) {
    const ics = queryToEventIcs(event, exdates, alarms);
    resolve(ics);
}

function catchExdates(event, exdates) {
    return new Promise(function (resolve, reject) {
        Promise.resolve(getRepeatExceptionsIcsForEvent(event.id)).then(
            function (result) {
                exdates[event.id] = result;
                resolve();
            },
            reject.bind(null)
        );
    });
}

function catchAlarms(event, alarms) {
    return new Promise(function (resolve, reject) {
        Promise.resolve(getAlarmsIcsForEvent(event.id)).then(
            function (result) {
                alarms[event.id] = result;
                resolve();
            },
            reject.bind(null)
        );
    });
}
