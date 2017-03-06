const scopesForToken = require('./scopesForToken');

/**
 * returns an array of scopeIds
 * @param scopeId
 * @param token
 */
function scopeIdsForToken(scopeId, token) {
    return new Promise((resolve, reject) => {
        if (scopeId) {
            resolve([scopeId]);
        }
        Promise.resolve(scopesForToken(token))
            .then((scopes) => { resolve(scopes.map(({id}) => id)); })
            .catch(reject);
    });
}

module.exports = scopeIdsForToken;
