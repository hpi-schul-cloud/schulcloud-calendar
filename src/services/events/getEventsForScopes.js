const allEvents = require('../../queries/allEvents');

function getEventsForScopes(user) {
    return new Promise(function (resolve, reject) {
        const referenceIds = [];
        for (let scope in user.scope) {
            referenceIds.push(scope);
        }
        referenceIds.push(user.id);


        const referenceIdPromises = [];
        for (let i = 0; i < referenceIds.length; i++) {
            referenceIdPromises.push(allEvents(referenceIds[i]));
        }
        Promise.all(referenceIdPromises).then(
            function (queryResults) {
                const events = {};
                queryResults.forEach(function (queryResult) {
                    //iterate over all events of a specific referenceId
                    queryResult.rows.forEach(function (event) {
                        if (event == null)
                            return;
                        if (!events[event.reference_id] || !Array.isArray(events[event.reference_id])) {
                            events[event.reference_id] = [];
                        }
                        //TODO: create new event object with structure independent from db (call adapter)
                        events[event.reference_id].push(event);
                    });
                });
                resolve(events);
            },
            reject.bind(null)
        );
    });
}

module.exports = getEventsForScopes;
