// Services
const getEvents = require('../services/events/getEvents');
const getScopesForToken = require('../services/scopes/getScopesForToken');
const createAndSendNotification = require('../services/notifications/createAndSendNotification');
const storeEventsInDb = require('../services/events/storeEventsInDb');

// Parsers
const jsonApiToJson = require('../parsers/jsonApiToJson');

// Queries
const deleteEvent = require('../queries/deleteEvent');

// HTTP Requests
const newNotificationForScopeIds = require('../http-requests/newNotificationForScopeIds');

// Authorization
const authorize = require("../authorization/index");

// Project Configuration
const config = require('../config');

// Event Handler
const returnError = require('./utils/returnError');
const returnSuccessWithoutContent = require('./utils/returnSuccessWithoutContent');
const returnJSONResponse = require('./utils/returnJSONResponse');

// Imports
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const cors = require('cors');

// Configuration
let corsOptions = {
    origin: config.CORS_ORIGIN
};
router.use(cors(corsOptions));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.options('/:eventId', cors(corsOptions));

// Routes

// DELETE /events/:eventId
router.delete('/:eventId', authorize, function (req, res) {
    const eventId = req.params.eventId;
    Promise.resolve(deleteEvent([eventId])).then(
        function (result) {
            returnSuccessWithoutContent(res);
            createAndSendNotification.forDeletedEvent(req.body.scopeIds);
        },
        returnError.bind(null, res)
    );
});

// GET /events/
router.get('/', authorize, function (req, res) {
    const filter = {
        scopeId: req.get('scope-id'),
        eventId: req.get('event-id'),
        from: req.get('from'),
        until: req.get('until'),
        all: req.get('all')
    };
    const token = req.get('Authorization');
    Promise.resolve(getEvents(filter, token)).then(
        function (result) {
            returnJSONResponse(res, result);
        },
        returnError.bind(null, res)
    );
});

// POST /events/
router.post('/', authorize, jsonApiToJson, function (req, res) {
    const events = req.events;
    if (!events || !Array.isArray(events))
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
});

// PUT /events/:eventId
router.put('/:eventId', authorize, function (req, res) {
    // TODO: implement
    returnError(res);

    // Promise.resolve(/*TODO*/).then(
    //     function (result) {
    //         res.status(200).send(/*TODO*/);
    //         createAndSendNotification.forModifiedEvent(req.body.scopeIds);
    //     },
    //     returnError.bind(null, res)
    // );
});

module.exports = router;
