const queryToIcs = require('./queryToIcs');
const icsToJson = require('./icsToJson');

function queryToJson(queryResult) {
    return icsToJson(queryToIcs(queryResult));
}

module.exports = queryToJson;
