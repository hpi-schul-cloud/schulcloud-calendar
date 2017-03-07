const getAllScopesForToken = require('../http/getAllScopesForToken');

function getScopesForToken(token) {
    return new Promise((resolve, reject) => {
        getAllScopesForToken(token).then((response) => {
            let scopes;
            try {
                scopes = JSON.parse(response);
            } catch (error) {
                reject(error);
            }
            scopes = scopes.data.map((scope) => {
                return {id: scope.id, name: scope.attributes.name};
            });
            resolve(scopes);
        }).catch((error) => {
            reject(error);
        });
    });
}

module.exports = getScopesForToken;
