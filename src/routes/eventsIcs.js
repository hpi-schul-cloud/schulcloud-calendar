// Services
const createAndSendNotification = require('../services/notifications/createAndSendNotification');
const storeEventsInDb = require('../services/events/storeEventsInDb');

// Utilities
const returnSuccessWithoutContent = require('./utils/returnSuccessWithoutContent');
const returnError = require('./utils/returnError');
const consoleError = require('../utils/consoleError');
const handleDeleteRequest = require("./utils/handleDeleteRequest");

// Parsers
const icsToJson = require('../parsers/icsToJson');

// Queries
const addAlarmToEvent = require('../queries/addAlarmToEvent');

// HTTP Requests
const newNotificationForScopeIds = require('../http-requests/newNotificationForScopeIds');

// Authorization
const authorize = require("../authorization/index");

// Project Configuration
const config = require('../config');

// Imports
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

// Configuration
const cors = require('cors');
let corsOptions = {
    origin: config.CORS_ORIGIN
};
router.use(cors(corsOptions));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

//Routes

router.post('/', authorize, icsToJson, function (req, res) {
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

router.put('/:eventId', authorize, icsToJson, function (req, res) {
    // TODO: implement
    returnError(res);

    // Promise.resolve(/*TODO*/).then(
    //     function (result) {
    //         res.status(200).send(/*TODO*/);
    //         createAndSendNotification.forModifiedEvent(req.body.scopeIds);
    //     },
    //     returnError.bind(null, res)
    // );

    // // TODO: Validate operation (e.g. don't create event if id couldn't be find, ...)
    // handleDeleteRequest(req, null);
    // handleInsertRequest(req, res, req.params.eventId);
});

module.exports = router;
