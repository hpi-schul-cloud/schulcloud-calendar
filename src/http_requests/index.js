const getRequest = require('./getRequest');
const config = require('./config');

function getAllUsersForUUID(uuid) {
    return getRequest(config.SCHULCLOUD_ALL_USERS_FOR_UUID + uuid);
}

function getAllScopesForToken(token) {
    return getRequest(config.SCHULCLOUD_ALL_SCOPES_FOR_TOKEN + token);
}

module.exports = {
    getAllUsersForUUID: getAllUsersForUUID,
    getAllScopesForToken: getAllScopesForToken
};
