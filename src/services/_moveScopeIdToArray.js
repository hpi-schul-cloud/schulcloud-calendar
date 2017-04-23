
/**
 * Transforms a single scope_id to an array of scope_ids
 * @param json   An array of events or subscriptions or a single event / subscription
 */
function moveScopeIdToArray(json) {
    return new Promise((resolve) => {
        if (Array.isArray(json)) {
            if (json.length === 0) resolve(json);
            json.forEach((object) => {
                object.scope_ids = [object.scope_id];
                delete object.scope_id;
            });
        } else {
            json.scope_ids = [json.scope_id];
            delete json.scope_id;
        }
        resolve(json);
    });
}

module.exports = moveScopeIdToArray;
