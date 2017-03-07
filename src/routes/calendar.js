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

// response
const returnError = require('./utils/returnError');
const returnSuccess = require('./utils/returnSuccess');
const returnICalendar = require('./utils/returnICalendar');

// content
const getScopesForToken = require('../services/scopes/getScopesForToken');
const getCalendarListOutput = require('../services/to-json-api/getCalendarList');
const scopeIdsForToken = require('../services/scopes/scopeIdsForToken');
const getEvents = require('../services/events/getEvents');
const flatten = require('../utils/flatten');
const queryToEventIcs = require('../parsers/queryToEventIcs');
const queryToIcs = require('../parsers/eventsToFinalIcs');

/* routes */

router.get('/calendar/list', authorize, function (req, res) {
    const token = req.get('Authorization');
    Promise.resolve(getScopesForToken(token))
        .then(getCalendarListOutput)
        .then((calendarList) => { returnSuccess(res, calendarList); })
        .catch((error) => { returnError(res, error); });
});

router.get('/calendar', authorize, function (req, res) {
    const scopeId = req.get('scope-id');
    const token = req.get('Authorization');
    Promise.resolve(scopeIdsForToken(scopeId, token))
        .then(getIcs)
        .then((icsString) => { returnICalendar(res, icsString); })
        .catch((error) => { returnError(res, error); });
});

function getIcs(scopeIds) {
    return new Promise((resolve, reject) => {
        Promise.all(scopeIds.map((scopeId) => {
            const filter = { scopeId, all: true };
            return getEvents(filter);
        }))
            .then((events) => {
                const eventsIcs = flatten(events).map(queryToEventIcs);
                resolve(queryToIcs(eventsIcs));
            })
            .catch(reject);
    });
}

module.exports = router;
