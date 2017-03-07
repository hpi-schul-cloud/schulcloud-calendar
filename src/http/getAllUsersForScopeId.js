const _getRequest = require('./_getRequest');
const config = require('../config');

function getAllUsersForScopeId(scopeId) {
    return _getRequest(config.SCHULCLOUD_ALL_USERS_FOR_UUID + scopeId);
}

module.exports = getAllUsersForScopeId;
