const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const cors = require('cors');

// configuration
const config = require('../config');
const corsOptions = {
    origin: config.CORS_ORIGIN
};
router.use(cors(corsOptions));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// preprocessing
const authorize = require('../infrastructure/authorization');
const jsonApiToJson = require('../parsers/jsonApiToJson');
const icsToJson = require('../parsers/icsToJson');

// response
const returnError = require('./utils/returnError');
const returnSuccess = require('./utils/returnSuccess');
const returnSuccessWithoutContent = require('./utils/returnSuccessWithoutContent');
const sendNotification = require('../services/sendNotification');

// content
const getEvents = require('../services/events/getEvents');
const storeEventsInDb = require('../services/events/storeEventsInDb');
const deleteEvent = require('../queries/deleteEvent');

/* routes */

router.get('/events', authorize, function (req, res) {
    const filter = {
        scopeId: req.get('scope-id'),
        eventId: req.get('event-id'),
        from: req.get('from'),
        until: req.get('until'),
        all: req.get('all')
    };
    const token = req.get('Authorization');
    Promise.resolve(getEvents(filter, token))
        .then((result) => { returnSuccess(res, result); })
        .catch((error) => { returnError(res, error); });
});

router.post('/events', authorize, jsonApiToJson, function (req, res) {
    // TODO works but there are funny errors, investigate
    insertEvents(req, res);
});

router.post('/events/ics', authorize, icsToJson, function (req, res) {
    // TODO works but there are funny errors, investigate
    insertEvents(req, res);
});

function insertEvents(req, res) {
    const events = req.events;
    Promise.resolve(storeEventsInDb(events))
        .then((result) => {
            // TODO: return eventId and maybe complete events
            returnSuccessWithoutContent(res);
            // TODO: always return array
            if (Array.isArray(result)) {
                result.forEach((response) => {
                    const { scopeIds, summary, start, end } = response;
                    sendNotification.forNewEvent(scopeIds, summary, start, end);
                });
            }
        })
        .catch((error) => { returnError(res, error); });
}

router.put('/events/:eventId', authorize, jsonApiToJson, function (req, res) {
    updateEvents(req, res);
});

router.put('/events/ics/:eventId', authorize, icsToJson, function (req, res) {
    updateEvents(req, res);
});

function updateEvents(req, res) {
    const eventId = req.params.eventId;
    Promise.resolve(deleteEvent(eventId))
        .then(() => {
            // TODO validate operation (e.g. don't create event if id couldn't be found, ...)
            // TODO validate result if at least one row has been deleted...
            // TODO eventId should not change
            insertEvents(req, res); })
        .catch((error) => { returnError(res, error); });
}

router.delete('/events/:eventId', authorize, function (req, res) {
    // TODO works but there are funny errors, investigate
    const eventId = req.params.eventId;
    const scopeIds = req.body.scopeIds;
    Promise.resolve(deleteEvent(eventId))
        .then(() => {
            returnSuccessWithoutContent(res);
            sendNotification.forDeletedEvent(scopeIds);
        })
        .catch((error) => { returnError(res, error); });
});

module.exports = router;
