const catchEventDetailsAndCreateIcs = require('./catchEventDetailsAndCreateIcs');
const eventsToFinalIcs = require('../../parsers/eventsToFinalIcs');

function createIcsFromEvents(events) {
    return new Promise(function (resolve, reject) {
        const queryPromises = [];
        Object.keys(events).forEach(function (key) {
            const eventsForReferenceId = events[key];
            if (Array.isArray(eventsForReferenceId)) {
                eventsForReferenceId.forEach(function (event) {
                    queryPromises.push(catchEventDetailsAndCreateIcs(event));
                });
            }
        });
        Promise.all(queryPromises).then(
            function (events) {
                const finalIcs = eventsToFinalIcs(events, null);    //TODO: scopes
                resolve(finalIcs);
            },
            reject.bind(null)
        );
    });
}

module.exports = createIcsFromEvents;
