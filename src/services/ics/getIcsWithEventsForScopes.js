const getEventsForScopes = require('../events/getEventsForScopes');
const createIcsFromEvents = require('../ics/createIcsFromEvents');

function getIcsWithEventsForScopes(user) {
    return new Promise(function (resolve, reject) {
        Promise.resolve(getEventsForScopes(user)).then(
            function (events) {
                Promise.resolve(createIcsFromEvents(events)).then(
                    resolve.bind(null),
                    reject.bind(null)
                );
            },
            reject.bind(null)
        );
    });
}

module.exports = getIcsWithEventsForScopes;
