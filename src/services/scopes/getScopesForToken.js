const getAllScopesForToken = require('../../http_requests/index').getAllScopesForToken;
const getCalendarListOutput = require('../to-json-api/getCalendarList');

function getScopesForToken(req) {
    const token = req.get('Authorization');
    return new Promise((resolve, reject) => {
        getAllScopesForToken(token)
        .then((response) => {
            let scopes;
            try {
              scopes = JSON.parse(response);
            }
            catch(error) {
              reject(error);
            }
            scopes = scopes.data.map((scope) => {
                return {
                  id: scope.id,
                  name: scope.attributes.name
                };
            });
            resolve(getCalendarListOutput(scopes));
        })
        .catch((error) => {
            reject(error);
        });
    });
}

module.exports = getScopesForToken;
