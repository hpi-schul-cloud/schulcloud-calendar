const getAllScopesForToken = require('../http/getAllScopesForToken');
const returnError = require('../utils/response/returnError');


function authentication(req, res, next) {
    // provide the data that was used to authenticate the request; if this is
    // not set then no attempt to authenticate is registered.
    let token = req.get('Authorization');

    if (req.method === 'GET' && (req.url === '/calendar' || req.url === '/calendar/') ) {
        token = req.query['authorization'];
    }

    if (token) {
        req.token = token;
        getAllScopesForToken(token).then(
            function (value) {
                value = JSON.parse(value);

                let user = {};
                user.scope = {};
                value.data.forEach(function (scope) {
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
                req.user = user;
                if (validAccess(req)) {
                    next();
                } else {
                    returnError(res, 'Access denied!', 403, 'Forbidden!');
                }
            },
            function () {
                returnError(res, 'Invalid Authorization token!', 401, 'Unauthorized');
            }
        );
    } else {
        returnError(res, 'Missing Authorization token!', 401, 'Unauthorized');
    }
}

function validAccess(req) {
    // TODO: Add more complex checks for the following:
    // Missing in query:
    // event-id (GET), subscription-id (GET), to-do-id (GET)
    // Missing in path:
    // event-id (PUT, DELETE), share-token (GET, DELETE), subscription-id (PUT, DELETE), to-do-id (PUT, DELETE)
    const user = req.user;

    if (req.method === 'GET') {
        return hasPermission(user, 'can-read', req.query['scope-id']);
    } else {
        let valid = true;
        // TODO not all requests have events! We need something like a switch here,
        // the if clause only is a quick fix
        if (req.events) {
            req.events.forEach(function(event) {
                event.scopeIds.forEach(function(scopeId) {
                    valid &= hasPermission(user, 'can-write', scopeId);
                });
            });
        }
        return valid;
    }
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

module.exports = authentication;
