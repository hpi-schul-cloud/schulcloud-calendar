const config = require('./../../config');
const validateJson = require('../validators/validateSubscriptionJson');
const logger = require('../../infrastructure/logger');
const removeNullValues = require('../../utils/removeNullValues');

function subscriptionsToJsonApi(subscriptionJson) {
    subscriptionJson = removeNullValues(subscriptionJson);
    let validationResult = validateJson(subscriptionJson, false);
    if (validationResult !== true) {
        logger.error(`[jsonToJsonApi] Got invalid subscriptions JSON: ${validationResult}`);
        return;
    }

    return {
        // Enhancement: Handle pagination
        links: {
            self: `${config.ROOT_URL}/subscriptions`
        },
        data: subscriptionJson.map(subscriptionToJsonApi),
		total:subscriptionJson.total
    };
}

function subscriptionToJsonApi(subscription) {
    const jsonApiSubscription = {
        type: 'subscription',
        id: subscription.id,
        attributes: {},
        relationships: {
            'scope-ids': subscription.scope_ids
        }
    };

    delete subscription.id;
    delete subscription.scope_ids;

    for (let key in subscription) {
        if (subscription.hasOwnProperty(key)) {
            jsonApiSubscription.attributes[key.replace(/_/g, '-')] = subscription[key];
        }
    }

    return jsonApiSubscription;
}

module.exports = subscriptionsToJsonApi;
