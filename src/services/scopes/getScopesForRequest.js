const getAllUsersForUUID = require('../../http').getAllUsersForUUID;
const logger = require('../../infrastructure/logger');

function getScopesForRequest(data) {
    return new Promise((resolve, reject) => {
        let scopeIds = data.relationships['scope-ids'];
        if (!Array.isArray(scopeIds) || scopeIds.length === 0) {
            logger.error('Got invalid array of scopeIds!');
            return null;
        }

        const separateUsers = data.relationships['separate-users'];
        if (separateUsers) {
            Promise.all(scopeIds.map(getAllUsersForUUID))
                .then(merge)
                .catch(returnError);
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

        function returnError(error) {
            reject(error);
        }
    });
}

module.exports = getScopesForRequest;
