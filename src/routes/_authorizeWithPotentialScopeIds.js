const { authorizeAccessToScopeId, authorizeAccessToObjects } = require('../security/authorization');

// authorization for DELETE and UPDATE
function authorizeWithPotentialScopeIds(objectId, scopeIds, user, token, getObject) {
    return new Promise((resolve, reject) => {
        if (scopeIds && scopeIds.length > 0) {
            Promise.all(scopeIds.map((scopeId) =>
                authorizeAccessToScopeId(user, scopeId))
            ).then(resolve).catch(reject);
        } else {
            const filter = { objectId };
            getObject(filter, token)
                .then((existingObjects) =>
                    authorizeAccessToObjects(user, 'can-write', existingObjects)
                )
                .then(resolve)
                .catch(reject);
        }
    });
}

module.exports = authorizeWithPotentialScopeIds;
