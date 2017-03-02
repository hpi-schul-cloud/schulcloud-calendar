const selectEvents = require('../../queries/selectEvents');
const flatten = require('../../utils/flatten');
const queryToIcs = require('../../parsers/eventsToFinalIcs');

function getCalendar(scopeIds) {
    const promises = scopeIds.map((scopeId) => {
        const filter = { scopeId, all: true }
        return selectEvents(filter);
    })

    const events = Promise.all(promises)
        .then((result) => { console.log('EVENTS: ' + flatten(result)) })
        .catch((error) => { console.log(error) })
}

module.exports = getCalendar;