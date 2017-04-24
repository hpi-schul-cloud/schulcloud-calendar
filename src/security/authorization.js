function authorizeAccessToScopeId(user, scopeId) {
    return new Promise((resolve, reject) => {
        if (scopeId && !hasPermission(user, 'can-read', scopeId)) {
            reject(accessDenied());
        } else {
            resolve();
        }
    });
}

function authorizeAccessToObjects(user, accessLevel, container) {
    return new Promise ((resolve, reject) => {
        if (!hasPermissionForAll(user, container, accessLevel)) {
            reject(accessDenied());
        } else {
            resolve(container);
        }
    });
}

// authorization for DELETE and UPDATE
function authorizeWithPotentialScopeIds(objectId, scopeIds, user, getObject, getOriginalObject) {
    return new Promise((resolve, reject) => {
        if (scopeIds && scopeIds.length > 0) {
            getOriginalObject(objectId)
                .then((originalEvent) => authorizeAccessToObjects(user, 'can-write', originalEvent))
                .then(resolve)
                .catch(reject);
        } else {
            const filter = { objectId };
            getObject(filter, user.scopes)
                .then((existingObjects) =>
                    authorizeAccessToObjects(user, 'can-write', existingObjects)
                )
                .then(resolve)
                .catch(reject);
        }
    });
}

function hasPermissionForAll(user, container, accessLevel) {
    let valid = true;
    container.forEach(function (element) {
        if (Array.isArray(element.scope_ids)) {
            // element.scope_ids is defined for incoming objects and should be an array
            element.scope_ids.forEach(function (scopeId) {
                valid &= hasPermission(user, accessLevel, scopeId);
            });
        } else if (element.scope_id) {
            // element.scope_id is defined for outgoing objects and is a single entry
            valid &= hasPermission(user, accessLevel, element.scope_id);
        }
    });
    return Boolean(valid);
}

function hasPermission(user, permission, scopeId) {
    if (typeof scopeId === 'undefined') {
        return true;
    } else if (user.id === scopeId) {
        return true;
    } else if (user.scopes.hasOwnProperty(scopeId) &&
        user.scopes[scopeId].authorities.hasOwnProperty(permission)) {
        return user.scopes[scopeId].authorities[permission];
    }
    return false;
}

function accessDenied() {
    const err = new Error('Access denied!');
    err.status = 403;
    err.title = 'Forbidden!';
    return err;
}

module.exports = {
    authorizeAccessToScopeId,
    authorizeAccessToObjects,
    authorizeWithPotentialScopeIds
};
