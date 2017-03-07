const returnError = require('../../routes/utils/returnError');

function jsonApiToJson(req, res, next) {
    if (req.body.data.length !== 1) {
        returnError(res, 'Invalid data array.');
        return;
    }

    // TODO further validation

    const subscription = req.body.data[0];
    req.subscription = {
        icsUrl: subscription.attributes['ics-url'],
        description: subscription.attributes['description'],
        separateUsers: subscription.relationships['separate-users'],
        scopeIds: subscription.relationships['scope-ids']
    };
    next();
}

module.exports = jsonApiToJson;
