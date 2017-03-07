const getAllUsersForUUID = require('../../http').getAllUsersForUUID;
const flatten = require('../../utils/flatten');

function scopeIdsForSeparateUsers(scopeIds, separateUsers) {
    return new Promise((resolve, reject) => {
        if (separateUsers) {
            Promise.all(scopeIds.map(getAllUsersForUUID))
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

module.exports = scopeIdsForSeparateUsers;
