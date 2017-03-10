const validJson = require('../validators/validateSubscriptionJson');
const returnError = require('../../utils/response/returnError');

function jsonApiToJson(req, res, next) {
    const subscriptions = req.body.data.map((subscription) => {
        return {
            icsUrl: subscription.attributes['ics-url'],
            description: subscription.attributes['description'],
            separateUsers: subscription.relationships['separate-users'],
            scopeIds: subscription.relationships['scope-ids']
        };
    });

    // TODO: Activate after renaming internal JSON
    // TODO: After that, remove the two validations from services/updateSubscription.js
    //let validationResult = validJson(subscriptions, true, req.method === 'PUT');
    let validationResult = true;
    if (validationResult === true) {
        req.subscriptions = subscriptions;
        next();
    } else {
        returnError(res, `Invalid JSON API definition: ${validationResult}`, 400, 'Bad Request');
    }
}

module.exports = jsonApiToJson;
