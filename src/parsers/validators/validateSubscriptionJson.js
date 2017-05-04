function validateJson(json, isIncoming = true, incomingRequestMethod = '') {
    if (isIncoming === true && incomingRequestMethod === '') {
        // Using POST as a default for incoming requests if not set
        incomingRequestMethod = 'POST';
    }

    let errorMessage = null;

    if (!Array.isArray(json)) {
        return "The value of 'data' must be an array.";
    }

    if ((incomingRequestMethod === 'PUT' || incomingRequestMethod === 'DELETE') && json.length !== 1) {
        return 'Only one subscription is allowed for this operation.';
    }

    json.every(function (subscription) {
        // Fields are required by our implementation

        if (incomingRequestMethod === 'POST'  && typeof subscription.separate_users === 'undefined') {
            errorMessage = "The attribute 'relationships'.'separate-users' is required for every new subscription.";
            return false;
        }

        if ((incomingRequestMethod === 'POST' || !isIncoming) && !(subscription.scope_ids && Array.isArray(subscription.scope_ids) && subscription.scope_ids.length > 0)) {
            errorMessage = "The attribute 'relationships'.'scope-ids' must be an array with one ore more entries";
            return false;
        }

        if ((incomingRequestMethod === 'PUT' || incomingRequestMethod === 'DELETE') &&
            subscription.scope_ids && !(Array.isArray(subscription.scope_ids) && subscription.scope_ids.length === 1)) {
            errorMessage = "The attribute 'relationships'.'scope-ids' is optional, but if it is set, it must be an array with one or more scope IDs.";
            return false;
        }

        if (incomingRequestMethod === 'DELETE') {
            return true;
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
