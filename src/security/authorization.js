function authorizeAccessToScopeId(user, scopeId) {
    return new Promise((resolve, reject) => {
        if (scopeId && !hasPermission(user, 'can-read', scopeId)) {
            reject(accessDenied());
        } else {
            resolve();
        }
    });
}

function authorizeAccessToObjects(user, access, object) {
    return new Promise ((resolve, reject) => {
        if (!hasPermissionForAll(user, object, access)) {
            reject(accessDenied());
        } else {
            resolve(object);
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
    } else if (user.scope.hasOwnProperty(scopeId) &&
        user.scope[scopeId].authorities.hasOwnProperty(permission)) {
        return user.scope[scopeId].authorities[permission];
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
    authorizeAccessToObjects
};
