// Services
const createAndSendNotification = require('../services/notifications/createAndSendNotification');
const storeEventsInDb = require('../services/events/storeEventsInDb');

// Event Handler
const returnError = require('./utils/returnError');
const returnSuccessWithoutContent = require('./utils/returnSuccessWithoutContent');

function handleJsonPOSTRequest(req, res) {
    const events = req.events;
    if (!events || !Array.isArray(events) /*|| events.length != 1*/)
        returnError(res);
    Promise.resolve(storeEventsInDb(events)).then(
        function (responses) {
            /**
             * response = [{eventId, scopeIds, summary, start, end}]
             */
            returnSuccessWithoutContent(res); //TODO: return (complete) events?
            if (Array.isArray(responses)) {
                responses.forEach(function (response) {
                    createAndSendNotification.forNewEvent(response.scopeIds, response.summary, response.start, response.end);
                });
            }
        },
        returnError.bind(null, res)
    );
}

module.exports = handleJsonPOSTRequest;
