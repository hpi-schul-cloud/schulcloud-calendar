const _getRequest = require('./_getRequest');
const config = require('../config');

function getAllScopesForToken(token, params = '') {
    return _getRequest(config.SCHULCLOUD_ALL_SCOPES_FOR_TOKEN + token + params);
}

module.exports = getAllScopesForToken;
