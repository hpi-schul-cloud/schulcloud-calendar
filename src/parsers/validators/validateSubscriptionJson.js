function validateJson(json, scopeIDsRequired = true, onlyOneSubscription = false) {
    let error_message = null;

    if (!Array.isArray(json)) {
        error_message = "The value of 'data' must be an array.";
        return false;
    }

    json.every(function (subscription) {
        // Fields are required by our implementation
        if (scopeIDsRequired && subscription.separateUsers === undefined) {
            error_message = "The attribute 'relationships'.'separate-users' is required for every subscription.";
            return false;
        }

        if (scopeIDsRequired && !(subscription.scopeIds && Array.isArray(subscription.scopeIds) && subscription.scopeIds.length === 1)) {
            error_message = "The attribute 'relationships'.'scope-ids' must be an array with exactly one ID.";
            return false;
        }

        if (!subscription.ics_url) {
            error_message = "The attribute 'ics-url' is required.";
            return false;
        }

        if (!subscription.description) {
            error_message = "The attribute 'description' is required.";
            return false;
        }
    });

    if (onlyOneSubscription && json.size !== 1) {
        error_message = 'Only one subscription is allowed for this operation.';
    }

    return error_message || true;
}

module.exports = validateJson;
