const getAllUsersForUUID = require('../../http_requests').getAllUsersForUUID;

function allScopeIds(data) {
        return new Promise((resolve, reject) => {
            let scopeIds = data.relationships['scope-ids'];
            if (!Array.isArray(scopeIds) || scopeIds.length === 0) {
                console.error("Got invalid 'scopeIds' array!");
                return null;
            }

            const separateUsers = data.relationships['separate-users'];
            if (separateUsers) {
                Promise.all(scopeIds.map(getAllUsersForUUID))
                    .then(merge)
                    .catch(handleError)
            } else {
                resolve(scopeIds);
            }

            function merge(responses) {
                const result = responses.reduce((userIds, response) => {
                    const responseObjects = JSON.parse(response).data;
                    const responseIds = responseObjects.map(({id}) => id);
                    return [...userIds, ...responseIds];
                }, []);
                resolve(result);
            }

            function handleError(error) {
                reject(error);
            }
        });
}

module.exports = allScopeIds;
