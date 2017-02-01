// Services
const getEvents = require('../services/events/getEvents');
const createAndSendNotification = require('../services/notifications/createAndSendNotification');

// Parsers
const jsonApiToJson = require('../parsers/jsonApiToJson');

// Queries
const deleteEvent = require('../queries/deleteEvent');

// Authorization
const authorize = require('../authorization/index');

// Project Configuration
const config = require('../config');

// Event Handler
const returnError = require('./utils/returnError');
const returnSuccessWithoutContent = require('./utils/returnSuccessWithoutContent');
const returnJSONResponse = require('./utils/returnJSONResponse');

// Request Handlers
const handleJsonPUTRequest = require('./request-handlers/handleJsonPUTRequest');
const handleJsonPOSTRequest = require('./request-handlers/handleJsonPOSTRequest');

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
    handleJsonPOSTRequest(req, res);
});

// PUT /events/:eventId
router.put('/:eventId', authorize, jsonApiToJson, function (req, res) {
    handleJsonPUTRequest(req, res);
});

// DELETE /events/:eventId
router.delete('/:eventId', authorize, function (req, res) {
    const eventId = req.params.eventId;
    Promise.resolve(deleteEvent([eventId])).then(
        function () {
            returnSuccessWithoutContent(res);
            createAndSendNotification.forDeletedEvent(req.body.scopeIds);
        },
        returnError.bind(null, res)
    );
});

module.exports = router;
