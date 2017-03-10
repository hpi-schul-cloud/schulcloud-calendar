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
const sendNotification = require('../services/sendNotification');
const eventsToJsonApi = require('../parsers/event/eventsToJsonApi');
const eventsToIcsInJsonApi = require('../parsers/event/eventsToIcsInJsonApi');

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

router.post('/events', jsonApiToJson, authorize, function (req, res) {
    const events = req.events;
    insertEvents(events)
        .then(eventsToJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch((error) => { returnError(res, error); });
});

router.post('/events/ics', icsToJson, authorize, function (req, res) {
    const events = req.events;
    insertEvents(events)
        .then(eventsToIcsInJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch((error) => { returnError(res, error); });
});

function insertEvents(events) {
    return new Promise(function (resolve, reject) {
        storeEvents(events)
            .then((result) => {
                // TODO: return eventId and maybe complete events
                result.forEach((response) => {
                    const {scope_id, summary, dtstart, dtend} = response;
                    sendNotification.forNewEvent(scope_id, summary, dtstart, dtend);
                });
                return result;
            })
            .then(resolve)
            .catch(reject);
    });
}

router.put('/events/:eventId', jsonApiToJson, authorize, function (req, res) {
    const eventId = req.params.eventId;
    const event = req.events;
    updateEvents(eventId, event)
        .then(eventsToJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch((error) => { returnError(res, error); });
});

router.put('/events/ics/:eventId', icsToJson, authorize, function (req, res) {
    const eventId = req.params.eventId;
    const event = req.events;
    updateEvents(eventId, event)
        .then(eventsToIcsInJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
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
    const eventId = req.params.eventId;
    // TODO delete only for scopeIds and check for alarms and exdates
    const scopeIds = req.body.scopeIds;
    deleteEvent(eventId)
        .then((deletedEvent) => {
            if (deletedEvent) {
                returnSuccess(res, 204);
                sendNotification.forDeletedEvent(
                    scopeIds,
                    deletedEvent['summary'],
                    deletedEvent['dtstart'],
                    deletedEvent['dtend']
                );
            } else {
                const error = 'Given eventId not found';
                const status = 404;
                const title = 'Query Error';
                returnError(res, error, status, title);
            }
        })
        .catch((error) => { returnError(res, error); });
});

module.exports = router;
