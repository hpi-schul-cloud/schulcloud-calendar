// Services
const createAndSendNotification = require('../../services/notifications/createAndSendNotification');
const storeEventsInDb = require('../../services/events/storeEventsInDb');

// Queries
const deleteEvent = require('../../queries/deleteEvent');

// Event Handler
const returnError = require('../utils/returnError');
const returnSuccessWithoutContent = require('../utils/returnSuccessWithoutContent');

function handleJsonPUTRequest(req, res) {
    const eventId = req.params.eventId;
    const updatedEvents = req.events;
    if (!updatedEvents || !Array.isArray(updatedEvents) || updatedEvents.length != 1)
        returnError(res);
    Promise.resolve(deleteEvent([eventId])).then(
        function (result) {
            // TODO: Validate operation (e.g. don't create event if id couldn't be find, ...)
            // validate result if at least one row has been deleted...
            Promise.resolve(storeEventsInDb(updatedEvents)).then(
                function (responses) {
                    /**
                     * response = [{eventId, scopeIds, summary, start, end}]
                     */
                    returnSuccessWithoutContent(res); //TODO: return (complete) events?
                    if (Array.isArray(responses)) {
                        responses.forEach(function (response) {
                            createAndSendNotification.forModifiedEvent(response.scopeIds, response.summary, response.start, response.end);
                        });
                    }
                },
                returnError.bind(null, res)
            );
        },
        returnError.bind(null, res)
    );
}

module.exports = handleJsonPUTRequest;
