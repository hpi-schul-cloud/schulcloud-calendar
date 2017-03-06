const getEvents = require('../events/getEvents');
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
                const eventsIcs = flatten(events).map(queryToEventIcs);
                resolve(queryToIcs(eventsIcs));
            })
            .catch(reject);
    });
}

function queryEvents(scopeId) {
    const filter = { scopeId, all: true };
    return getEvents(filter);
}

module.exports = getCalendar;
