const getAllScopesForToken = require('../http_requests').getAllScopesForToken;
const handleError = require('../routes/utils/handleError');


function authentication(req, res, next) {
    // provide the data that was used to authenticate the request; if this is
    // not set then no attempt to authenticate is registered.
    const token = req.get('Authorization');

    if (token) {
        Promise.resolve(getAllScopesForToken(token)).then(function (value) {
            console.log(value);
            next();
        }, function (value) {
            handleError(res, 'Invalid Authorization token!', 401, 'Unauthorized')
        });
    } else {
        handleError(res, 'Invalid Authorization token!', 401, 'Unauthorized')
    }
}

module.exports = authentication;
