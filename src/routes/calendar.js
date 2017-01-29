const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const cors = require('cors');
let corsOptions = {
    origin: 'https://schulcloud.github.io'
};
router.use(cors(corsOptions));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

const getEventsForToken = require('../services/events/getEventsForToken');
const getScopesForToken = require('../services/scopes/getScopesForToken');
const Readable = require('stream').Readable;
const handleError = require('./utils/returnError');
const handleSuccess = require('./utils/returnSuccess');
const getIcsWithEventsForScopes = require('../services/ics/getIcsWithEventsForScopes');
const getCalendarListOutput = require('../services/to-json-api/getCalendarList');

const getRepeatExceptionsIcsForEvent = require('../queries/getRepeatExceptionForEvent').getRepeatExceptionsIcsForEvent;
const authorize = require("../authorization/index");

// GET /calendar/test
router.get('/test', authorize, function (req, res) {
    Promise.resolve(getIcsWithEventsForScopes(req.user)).then(
        function (finalIcsString) {
            const finalIcs = new Readable();
            finalIcs.push(finalIcsString);
            finalIcs.push(null);
            res.writeHead(200, {
                'Content-Disposition': 'attachment; filename=calendar.ics',
                'Content-Type': 'text/calendar', //application/octet-stream (?)
                'Content-Length': finalIcsString.length
            });
            finalIcs.pipe(res);
    },
    handleError.bind(null, res));
});

// GET /calendar
router.get('/', authorize, function (req, res) {
    // TODO: implement
    handleError(res);
});

// GET /calendar/list
router.get('/list', authorize, function (req, res) {
  const token = req.get('Authorization')
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
