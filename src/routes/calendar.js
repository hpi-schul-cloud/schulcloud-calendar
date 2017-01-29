// Services
const getEventsForToken = require('../services/events/getEventsForToken');
const getScopesForToken = require('../services/scopes/getScopesForToken');
const getIcsWithEventsForScopes = require('../services/ics/getIcsWithEventsForScopes');
const getCalendarListOutput = require('../services/to-json-api/getCalendarList');

// Utilities
const handleError = require('./utils/returnError');
const handleSuccess = require('./utils/returnSuccess');
const returnICalendar = require('./utils/returnICalendar');

// Queries
const getRepeatExceptionsIcsForEvent = require('../queries/getRepeatExceptionForEvent').getRepeatExceptionsIcsForEvent;

// Authorization
const authorize = require("../authorization/index");

// Project Configuration
const config = require('../config');

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
router.use(bodyParser.urlencoded({extended: false}));

// Routes

// GET /calendar/test
router.get('/test', authorize, function (req, res) {
    Promise.resolve(getIcsWithEventsForScopes(req.user)).then(
        function (finalIcsString) {
            returnICalendar(res, finalIcsString);
        },
        handleError.bind(null, res)
    );
});

// GET /calendar
router.get('/', authorize, function (req, res) {
    // TODO: implement
    handleError(res);
});

// GET /calendar/list
router.get('/list', authorize, function (req, res) {
    // TODO: Reuse req.user
  const token = req.get('Authorization');
  Promise.resolve(getScopesForToken(token))
    .then(
      (scopes) => {
        handleSuccess(res, getCalendarListOutput(scopes));
      }
    )
    .catch(
      (error) => {
        handleError(res, error);
      }
    );
});

module.exports = router;
