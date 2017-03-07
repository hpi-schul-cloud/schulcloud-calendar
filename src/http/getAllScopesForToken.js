const _getRequest = require('./_getRequest');
const config = require('../config');

function getAllScopesForToken(token) {
    return _getRequest(config.SCHULCLOUD_ALL_SCOPES_FOR_TOKEN + token);
}

module.exports = getAllScopesForToken;
