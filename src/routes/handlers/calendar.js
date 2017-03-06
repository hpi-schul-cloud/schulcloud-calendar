const getScopesForToken = require('../../services/scopes/getScopesForToken');
const getCalendarListOutput = require('../../services/to-json-api/getCalendarList');
const getScopeIds = require('../../services/getScopeIds');
const getEvents = require('../../services/events/getEvents');
const flatten = require('../../utils/flatten');
const queryToEventIcs = require('../../parsers/queryToEventIcs');
const queryToIcs = require('../../parsers/eventsToFinalIcs');

function get(scopeId, token) {
    return new Promise((resolve, reject) => {
        Promise.resolve(getScopeIds(scopeId, token))
            .then(getIcs)
            .then(resolve)
            .catch(reject);
    });

    function getIcs(scopeIds) {
        return new Promise((resolve, reject) => {
            Promise.all(scopeIds.map((scopeId) => {
                const filter = { scopeId, all: true };
                return getEvents(filter);
            }))
                .then((events) => {
                    const eventsIcs = flatten(events).map(queryToEventIcs);
                    resolve(queryToIcs(eventsIcs));
                })
                .catch(reject);
        });
    }
}

function list(token) {
    return new Promise((resolve, reject) => {
        Promise.resolve(getScopesForToken(token))
            .then(getCalendarListOutput)
            .then(resolve)
            .catch(reject);
    });
}

module.exports = { get, list };
