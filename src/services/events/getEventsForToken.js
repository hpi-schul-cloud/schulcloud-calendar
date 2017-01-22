const getAllScopesForToken = require('../../http_requests/index').getAllScopesForToken;
const getEventsForScopes = require('./getEventsForScopes');

/**
 * @deprecated
 */
function getEventsForToken(token) {
    return new Promise(function (resolve, reject) {
        Promise.resolve(getAllScopesForToken(token)).then(
            function (result) {
                const scopes = JSON.parse(result).data;
                getEventsForScopes(resolve, reject, scopes);
            },
            reject.bind(null)
        );
    })
}

module.exports = getEventsForToken;
