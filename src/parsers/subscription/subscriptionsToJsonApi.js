const config = require('./../../config');
const validJson = require('../validators/validateSubscriptionJson');
const logger = require('../../infrastructure/logger');
const removeNullValues = require('../../utils/removeNullValues');

function subscriptionsToJsonApi(subscriptionJson) {
    subscriptionJson = removeNullValues(subscriptionJson);
    let validationResult = validJson(subscriptionJson, false);
    if (validationResult !== true) {
        logger.error(`[jsonToJsonApi] Got invalid subscriptions JSON: ${validationResult}`);
        return;
    }

    return {
        // Enhancement: Handle pagination
        links: {
            self: `${config.ROOT_URL}/subscriptions`
        },
        data: subscriptionJson.map(subscriptionToJsonApi)
    };
}

function subscriptionToJsonApi(subscription) {
    const jsonApiSubscription = {
        type: 'subscription',
        id: subscription.id,
        attributes: {},
        relationships: {
            'scope-ids': [subscription.scope_id]
        }
    };

    delete subscription.id;
    delete subscription.scope_id;

    for (let key in subscription) {
        if (subscription.hasOwnProperty(key)) {
            jsonApiSubscription.attributes[key.replace(/_/g, '-')] = subscription[key];
        }
    }

    return jsonApiSubscription;
}

module.exports = subscriptionsToJsonApi;
