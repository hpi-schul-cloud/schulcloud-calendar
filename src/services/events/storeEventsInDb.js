// Services
const handleJson = require('../json/handleJson');

// Imports
const uuidV4 = require('uuid/v4');

function storeEventsInDb(events) {
    return new Promise(function (resolve, reject) {
        const uidEventIdMap = {};
        const jsonHandlerPromises = [];

        events.forEach(function(event) {
            if (!uidEventIdMap[event.id])
                uidEventIdMap[event.id] = uuidV4();
            jsonHandlerPromises.push(handleJson(event, event.separateUsers, event.scopeIds, uidEventIdMap[event.id]));
        });

        Promise.all(jsonHandlerPromises).then(
            resolve.bind(null),
            reject.bind(null)
        );
    });
}

module.exports = storeEventsInDb;
