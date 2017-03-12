const validJson = require('../validators/validateSubscriptionJson');
const returnError = require('../../utils/response/returnError');

function jsonApiToJson(req, res, next) {
    const subscriptions = req.body.data.map((subscription) => {
        return {
            ics_url: subscription.attributes['ics-url'],
            description: subscription.attributes['description'],
            separate_users: subscription.relationships['separate-users'],
            scope_ids: subscription.relationships['scope-ids']
        };
    });

    let validationResult = validJson(subscriptions, true, req.method === 'PUT');
    if (validationResult === true) {
        req.subscriptions = subscriptions;
        next();
    } else {
        returnError(res, `Invalid JSON API definition: ${validationResult}`, 400, 'Bad Request');
    }
}

module.exports = jsonApiToJson;
