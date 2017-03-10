function validateJson(json, scopeIDsRequired = true, onlyOneSubscriptionOrScopeId = false) {
    let errorMessage = null;

    if (!Array.isArray(json)) {
        return "The value of 'data' must be an array.";
    }

    if (onlyOneSubscriptionOrScopeId && json.length !== 1) {
        return 'Only one subscription is allowed for this operation.';
    }

    json.every(function (subscription) {
        // Fields are required by our implementation
        if (scopeIDsRequired && subscription.separate_users === undefined) {
            errorMessage = "The attribute 'relationships'.'separate-users' is required for every subscription.";
            return false;
        }

        if (scopeIDsRequired && !onlyOneSubscriptionOrScopeId && !(subscription.scope_ids && Array.isArray(subscription.scope_ids) && subscription.scope_ids.length > 0)) {
            errorMessage = "The attribute 'relationships'.'scope-ids' must be an array with one ore more entries";
            return false;
        } else if (scopeIDsRequired && onlyOneSubscriptionOrScopeId && !(subscription.scope_ids && Array.isArray(subscription.scope_ids) && subscription.scope_ids.length === 1)) {
            errorMessage = "The attribute 'relationships'.'scope-ids' must be an array with exactly one ID";
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

    return errorMessage || true;
}

module.exports = validateJson;
