// Services
const handleJson = require('../services/json/handleJson');

// Utilities
const handleSuccess = require('./utils/returnSuccess');
const handleError = require('./utils/returnError');
const consoleError = require('../utils/consoleError');
const handleDeleteRequest = require("./utils/handleDeleteRequest");

// Parsers
const icsToJson = require('../parsers/icsToJson');

// Queries
const insertEvents = require('../queries/insertEvents');
const addRepeatExceptionToEvent = require('../queries/addRepeatExceptionToEvent');
const addAlarmToEvent = require('../queries/addAlarmToEvent');

// HTTP Requests
const getAllUsersForUUID = require('../http-requests').getAllUsersForUUID;
const newNotificationForScopeIds = require('../http-requests/newNotificationForScopeIds');

// Authorization
const authorize = require("../authorization/index");

// Project Configuration
const config = require('../config');

// Imports
const express = require('express');
const bodyParser = require('body-parser');
const uuidV4 = require('uuid/v4');
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
    handleInsertRequest(req, res, uuidV4());

    //TODO: only, if created successful
    const scopeIds = req.body.scopeIds;
    const title = "Neuer Termin erstellt";
    const body = "Es wurde ein neuer Termin für Sie erstellt!";
    newNotificationForScopeIds(title, body, scopeIds);
});

router.put('/:eventId', authorize, icsToJson, function (req, res) {
    // TODO: Validate operation (e.g. don't create event if id couldn't be find, ...)
    handleDeleteRequest(req, null);
    handleInsertRequest(req, res, req.params.eventId);

    //TODO: only, if modified successful
    const scopeIds = req.body.scopeIds;
    const title = "Ein Termin wurde verändert";
    const body = "Einer Ihrer Termine wurde verändert!";
    newNotificationForScopeIds(title, body, scopeIds);
});

function handleInsertRequest(req, res, externalEventId) {
    req.events.forEach(function(event) {
        // TODO: Move to validation
        if (!Array.isArray(event.scopeIds) || event.scopeIds.length === 0) {
            consoleError("Got invalid 'scopeIds' array!");
            handleError(res);
        } else {
            handleJson(event, event.separateUsers, event.scopeIds, externalEventId, req, res);
        }
    });
}

module.exports = router;
