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
                    resolve(users.reduce((uniqueUsers, user) => {
                        return uniqueUsers.indexOf(user.id) === -1
                            ? [ ...uniqueUsers, user.id ]
                            : uniqueUsers;
                    }, []));
                })
                .catch((error) => { reject(`${error}, invalid scopeIds`); });
        } else {
            resolve(scopeIds);
        }
    });
}

module.exports = getScopeIdsForSeparateUsers;
