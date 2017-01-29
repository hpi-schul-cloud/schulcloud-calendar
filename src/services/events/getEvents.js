
const getEventsForFilter = require('./getEventsForFilter');
const getScopesForToken = require('../scopes/getScopesForToken');
const getEventsPerScope = require('./getEventsPerScope');

function getEvents(filter, token) {
    return new Promise(function (resolve, reject) {
        if (filter.scopeId || filter.eventId) {
            getEventsForFilter(filter)
                .then((events) => { resolve(events) })
                .catch((error) => { reject(error) })
        } else {
            getScopesForToken(token)
                .then((scopes) => { resolve(getEventsPerScope(scopes, filter)) })
                .catch((error) => { reject(res, error) })
        }
    });
}

module.exports = getEvents;
