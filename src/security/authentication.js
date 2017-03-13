const getAllScopesForToken = require('../http/getAllScopesForToken');
const returnError = require('../utils/response/returnError');

function authenticateFromHeaderField(req, res, next) {
    const token = req.get('Authorization');
    getUser(req, res, next, token);
}

function authenticateFromQueryParameter(req, res, next) {
    const token = req.query['authorization'];
    getUser(req, res, next, token);
}

function getUser(req, res, next, token) {
    if (token) {
        req.token = token;
        getAllScopesForToken(token)
            .then((apiResponse) => {
                req.user = parseUserInformation(apiResponse);
                next();
            })
            .catch(() => {
                returnError(res, 'Invalid Authorization token!', 401, 'Unauthorized');
            });
    } else {
        returnError(res, 'Missing Authorization token!', 401, 'Unauthorized');
    }
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

module.exports = {
    authenticateFromHeaderField,
    authenticateFromQueryParameter
};
