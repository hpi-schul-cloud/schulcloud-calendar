const getEvents = require('../../queries/getEvents');
const flatten = require('../../utils/flatten');
const queryToEventIcs = require('../../parsers/queryToEventIcs');
const queryToIcs = require('../../parsers/eventsToFinalIcs');

/**
 * returns an ICS string
 * @param scopeIds
 */
function getCalendar(scopeIds) {
    return new Promise((resolve, reject) => {
        Promise.all(scopeIds.map(queryEvents))
            .then((events) => {
                const eventIcs = flatten(events).map(queryToEventIcs);
                resolve(queryToIcs(eventIcs));
            })
            .catch(reject);
    });
}

function queryEvents(scopeId) {
    const filter = { scopeId, all: true };
    // TODO also get alarms etc.
    return getEvents(filter);
}

module.exports = getCalendar;
