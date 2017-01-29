

function storeEventsInDb(events) {
    return new Promise(function (resolve, reject) {
        // const externalEventId = uuidV4();
        const uidEventIdMap = {};
        const jsonHandlerPromises = [];

        events.forEach(function(event) {
            if (!uidEventIdMap[event.id])
                uidEventIdMap[event.id] = uuidV4();
            jsonHandlerPromises.push(handleJson(event, event.separateUsers, event.scopeIds, uidEventIdMap[event.id], req, res));
        });

        Promise.all(jsonHandlerPromises).then(
            resolve.bind(null),
            reject.bind(null)
        );
    });
}
