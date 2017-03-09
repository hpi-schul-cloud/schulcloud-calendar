const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const cors = require('cors');
const config = require('../config');
const corsOptions = {
    origin: config.CORS_ORIGIN
};
router.use(cors(corsOptions));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// preprocessing
const authorize = require('../infrastructure/authorization');
const jsonApiToJson = require('../parsers/event/jsonApiToJson');
const icsToJson = require('../parsers/event/icsToJson');

// response
const returnError = require('../utils/response/returnError');
const returnSuccess = require('../utils/response/returnSuccess');
const returnIcs = require('../utils/response/returnIcs');
const sendNotification = require('../services/sendNotification');
const eventsToJsonApi = require('../formatter/eventsToJsonApi');
const eventsToIcs = require('../formatter/eventsToIcs');

// content
const getEvents = require('../services/getEvents');
const storeEvents = require('../services/storeEvents');
const deleteEvent = require('../queries/deleteEvent');

/* routes */

router.get('/events', authorize, function (req, res) {
    const filter = {
        scopeId: req.query['scope-id'],
        eventId: req.query['event-id'],
        from: req.query['from'],
        until: req.query['until'],
        all: req.query['all']
    };
    const token = req.get('Authorization');
    getEvents(filter, token)
        .then(eventsToJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch((error) => { returnError(res, error); });
});

router.post('/events', authorize, jsonApiToJson, function (req, res) {
    const events = req.events;
    insertEvents(events)
        .then(eventsToJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch((error) => { returnError(res, error); });
});

router.post('/events/ics', authorize, icsToJson, function (req, res) {
    const events = req.events;
    insertEvents(events)
        .then(eventsToIcs)
        .then((icsString) => { returnIcs(res, icsString); })
        .catch((error) => { returnError(res, error); });
});

// TODO works but there are funny errors, investigate
function insertEvents(events) {
    return new Promise(function (resolve, reject) {
        storeEvents(events)
            .then((result) => {
                // TODO: return eventId and maybe complete events
                result.forEach((response) => {
                    const {reference_id, summary, dtstart, dtend} = response;
                    sendNotification.forNewEvent(reference_id, summary, dtstart, dtend);
                });
                return result;
            }).then(resolve)
            .catch(reject);
    });
}

router.put('/events/:eventId', authorize, jsonApiToJson, function (req, res) {
    const eventId = req.params.eventId;
    const event = req.events;
    updateEvents(eventId, event)
        .then(eventsToJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch((error) => { returnError(res, error); });
});

router.put('/events/ics/:eventId', authorize, icsToJson, function (req, res) {
    const eventId = req.params.eventId;
    const event = req.events;
    updateEvents(eventId, event)
        .then(eventsToIcs)
        .then((icsString) => { returnIcs(res, icsString); })
        .catch((error) => { returnError(res, error); });
});

function updateEvents(eventId, event) {
    return new Promise(function (resolve, reject) {
        deleteEvent(eventId)
            .then(() => {
                // TODO validate operation (e.g. don't create event if id couldn't be found, ...)
                // TODO validate result if at least one row has been deleted...
                // TODO eventId should not change
                // TODO notification for changed, not for inserted event
                return insertEvents(event);
            })
            .then(resolve)
            .catch(reject);
    });
}

router.delete('/events/:eventId', authorize, function (req, res) {
    // TODO works but there are funny errors, investigate
    // TODO delete only for scopeIds
    const eventId = req.params.eventId;
    const scopeIds = req.body.scopeIds;
    deleteEvent(eventId)
        .then(() => {
            returnSuccess(res, 204);
            sendNotification.forDeletedEvent(scopeIds);
        })
        .catch((error) => { returnError(res, error); });
});

module.exports = router;
