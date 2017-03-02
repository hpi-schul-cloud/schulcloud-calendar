const getEventsForFilter = require('./getEventsForFilter');
const flatten = require('../../utils/flatten');

function getEventsPerScope(scopes, filter) {
    return new Promise(function (resolve, reject) {
        const { from, until, all } = filter;
        const eventsPerScope = scopes.map((scope) => {
            filter = { scopeId: scope.id, from, until, all };
            return getEventsForFilter(filter);
        });

        Promise.all(eventsPerScope)
            .then((eventsCollection) => {
                resolve(flatten(eventsCollection));
            })
            .catch((error) => { reject(error); });
    });
}

module.exports = getEventsPerScope;
