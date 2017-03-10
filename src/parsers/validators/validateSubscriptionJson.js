function validateJson(json, scopeIDsRequired = true, onlyOneSubscription = false) {
    let errorMessage = null;

    if (!Array.isArray(json)) {
        errorMessage = "The value of 'data' must be an array.";
        return false;
    }

    json.every(function (subscription) {
        // Fields are required by our implementation
        if (scopeIDsRequired && subscription.separateUsers === undefined) {
            errorMessage = "The attribute 'relationships'.'separate-users' is required for every subscription.";
            return false;
        }

        if (scopeIDsRequired && !(subscription.scopeIds && Array.isArray(subscription.scopeIds) && subscription.scopeIds.length === 1)) {
            errorMessage = "The attribute 'relationships'.'scope-ids' must be an array with exactly one ID.";
            return false;
        }

        if (!subscription.ics_url) {
            errorMessage = "The attribute 'ics-url' is required.";
            return false;
        }

        if (!subscription.description) {
            errorMessage = "The attribute 'description' is required.";
            return false;
        }
    });

    if (onlyOneSubscription && json.size !== 1) {
        errorMessage = 'Only one subscription is allowed for this operation.';
    }

    return errorMessage || true;
}

module.exports = validateJson;
