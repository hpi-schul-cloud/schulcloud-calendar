const allEvents = require('../../queries/allEvents');

function getEventsForScopes(resolve, reject, scopes) {
    //TODO: it might be better to extract ids in function which catches the scopes...
    const referenceIds = scopes.map(function (entry) {
        return entry.id;
    });
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
}

module.exports = getEventsForScopes;
