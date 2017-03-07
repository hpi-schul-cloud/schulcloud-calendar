const getAllUsersForScopeId = require('../http/getAllUsersForScopeId');
const flatten = require('../utils/flatten');

function getScopeIdsForSeparateUsers(scopeIds, separateUsers) {
    return new Promise((resolve, reject) => {
        if (separateUsers) {
            Promise.all(scopeIds.map(getAllUsersForScopeId))
                .then((responses) => {
                    const users = flatten(responses.map((response) => {
                        return JSON.parse(response).data;
                    }));
                    resolve(users.map(({id}) => id));
                })
                .catch(reject);
        } else {
            resolve(scopeIds);
        }
    });
}

module.exports = getScopeIdsForSeparateUsers;
