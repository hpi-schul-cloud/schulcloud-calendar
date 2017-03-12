const getAllScopesForToken = require('../http/getAllScopesForToken');
const returnError = require('../utils/response/returnError');
const flatten = require('../utils/flatten');

/**
 * Validate access to the requested resource based on the Authorization token used.
 * @param   requiredAccessRights: Defines an object with the required access rights to validate and an array as key
 *                                with object names to check. This name should match a name known by req,
 *                                e.g. 'events' is given, so that req.events will be checked.
 * @returns function to act as middleware. This will call the next() handler to continue with the request
 *          or returnError() to indicate an error
 */
function authentication(requiredAccessRights = {}) {
    return function (req, res, next) {
        getUser(req)
            .then(validateScopeIdInQuery)
            .then((req) => {
                return validateAccess(req, requiredAccessRights)
            })
            .then((result) => {
                if (result === true) {
                    next();
                } else {
                    returnError(res, 'Access denied!', 403, 'Forbidden!');
                }
            })
            .catch(() => {
                returnError(res, 'Invalid Authorization token!', 401, 'Unauthorized');
            });
    }
}

function validateScopeIdInQuery(req) {
    if (req.scopeIdValid === undefined) {
        if (req.query['scope-id']) {
            req.scopeIdValid = hasPermission(req.user, 'can-read', req.query['scope-id']);
        } else {
            req.scopeIdValid = true;
        }
    }
    return req;
}

function validateAccess(req, requiredAccessRights) {
    if (req.scopeIdValid === false) {
        return false;
    }

    const user = req.user;
    let valid = true;

    for (let accessRight in requiredAccessRights) {
        if (requiredAccessRights.hasOwnProperty(accessRight)) {
            let containerNames = requiredAccessRights[accessRight];
            containerNames.forEach((jsonName) => {
                let json = req[jsonName] || [];
                valid &= hasPermissionForAll(user, json, accessRight);
            });
        }
    }

    return Boolean(valid);
}

function hasPermissionForAll(user, container, accessLevel) {
    let valid = true;
    container.forEach(function (element) {
        if (Array.isArray(element.scope_ids)) {
            element.scope_ids.forEach(function (scopeId) {
                valid &= hasPermission(user, accessLevel, scopeId);
            });
        } else if (element.scope_id) {
            // TODO: Currently only in use by subscriptions, refactor to be an array
            valid &= hasPermission(user, accessLevel, element.scope_id);
        }
    });
    return Boolean(valid);
}

function hasPermission(user, permission, scopeId) {
    if (scopeId === undefined) {
        return true;
    } else if (user.id === scopeId) {
        return true;
    } else if (user.scope.hasOwnProperty(scopeId) &&
        user.scope[scopeId].authorities.hasOwnProperty(permission)) {
        return user.scope[scopeId].authorities[permission];
    }
    return false;
}

function getUser(req) {
    return new Promise((resolve) => {
        if (!req.user) {
            let token = req.get('Authorization');
            if (req.method === 'GET' && (/^\/calendar[\/]?\?/.test(req.url))) {
                token = req.query['authorization'];
            }

            if (token) {
                req.token = token;
                getAllScopesForToken(token)
                    .then((apiResponse) => {
                        req.user = parseUserInformation(apiResponse);
                        resolve(req);
                    })
            } else {
                return returnError(res, 'Missing Authorization token!', 401, 'Unauthorized');
            }
        } else {
            resolve(req);
        }
    });
}

function parseUserInformation(apiResponse) {
    apiResponse = JSON.parse(apiResponse);

    let user = {};
    user.scope = {};
    apiResponse.data.forEach(function (scope) {
        if (scope.type === 'user') {
            user.id = scope.id;
            user.name = scope.attributes.name;
        } else if (scope.type === 'scope') {
            user.scope[scope.id] = {};
            user.scope[scope.id].id = scope.id;
            user.scope[scope.id].name = scope.attributes.name;
            user.scope[scope.id].authorities = {};
            scope.attributes.authorities.forEach(function (authority) {
                user.scope[scope.id].authorities[authority] = true;
            });
        }
    });
    return user;
}


module.exports = authentication;
