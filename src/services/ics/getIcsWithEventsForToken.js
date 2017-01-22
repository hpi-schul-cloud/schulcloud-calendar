const getEventsForToken = require('../events/getEventsForToken');
const createIcsFromEvents = require('../ics/createIcsFromEvents');

function getIcsWithEventsForToken(token) {
    return new Promise(function (resolve, reject) {
        Promise.resolve(getEventsForToken(token)).then(
            function (events) {
                Promise.resolve(createIcsFromEvents(events)).then(
                    resolve.bind(null),
                    reject.bind(null)
                )
            },
            reject.bind(null)
        )
    })
}

module.exports = getIcsWithEventsForToken;
