const queryToIcs = require('./queryToIcs');
const icsToJson = require('./icsToJson');

/**
 * @deprecated uses icsToJson, which is also deprecated, see note in icsToJson...
 */
function queryToJson(queryResult) {
    return icsToJson(queryToIcs(queryResult));
}

module.exports = queryToJson;
