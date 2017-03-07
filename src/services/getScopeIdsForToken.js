const getScopesForToken = require('./getScopesForToken');

/**
 * returns an array of scopeIds
 * @param scopeId
 * @param token
 */
function getScopeIdsForToken(token, scopeId) {
    return new Promise((resolve, reject) => {
        if (scopeId) {
            resolve([scopeId]);
        }
        Promise.resolve(getScopesForToken(token))
            .then((scopes) => { resolve(scopes.map(({id}) => id)); })
            .catch(reject);
    });
}

module.exports = getScopeIdsForToken;
