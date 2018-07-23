const validateJson = require('../validators/validateSubscriptionJson');
const returnError = require('../../utils/response/returnError');

function jsonApiToJson(req, res, next) {
	if(req.body.data===undefined){	
		returnError(res, 'Invalid request body', 400, 'Bad Request');
		return
	}

    const subscriptions = req.body.data.map((subscription) => {
        let json = {};

        if (req.method !== 'DELETE') {
            json.ics_url = subscription.attributes['ics-url'];
            json.description = subscription.attributes['description'];
            json.separate_users = subscription.relationships['separate-users'];
        }
        if (subscription.relationships) {
            json.scope_ids = subscription.relationships['scope-ids'];
        }
        return json;
    });

    let validationResult = validateJson(subscriptions, true, req.method);
    if (validationResult === true) {
        req.subscriptions = subscriptions;
        next();
    } else {
        returnError(res, `Invalid JSON API definition: ${validationResult}`, 400, 'Bad Request');
    }
}

module.exports = jsonApiToJson;
