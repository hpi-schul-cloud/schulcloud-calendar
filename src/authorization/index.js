const getAllScopesForToken = require('../http-requests').getAllScopesForToken;
const returnError = require('../routes/utils/returnError');


function authentication(req, res, next) {
    // provide the data that was used to authenticate the request; if this is
    // not set then no attempt to authenticate is registered.
    const token = req.get('Authorization');

    if (token) {
        req.token = token;
        Promise.resolve(getAllScopesForToken(token)).then(
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
                next();
            },
            function () {
                returnError(res, 'Invalid Authorization token!', 401, 'Unauthorized');
            }
        );
    } else {
        returnError(res, 'Invalid Authorization token!', 401, 'Unauthorized');
    }
}

module.exports = authentication;
