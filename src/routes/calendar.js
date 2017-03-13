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
const returnError = require('../utils/response/returnError');
const returnSuccess = require('../utils/response/returnSuccess');
const returnIcs = require('../utils/response/returnIcs');

// content
const getScopesForToken = require('../services/scopes/getScopesForToken');
const scopesToCalendarList = require('../parsers/calendar/scopesToCalendarList');
const getEventsFromDb = require('../services/events/getEvents');
const flatten = require('../utils/flatten');
const eventsToIcs = require('../parsers/event/eventsToIcs');

/* routes */

router.get('/calendar/list', authorize, function (req, res) {
    const token = req.get('Authorization');
    getScopesForToken(token)
        .then(scopesToCalendarList)
        .then((calendarList) => returnSuccess(res, 200, calendarList))
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
});

router.get('/calendar', authorize, function (req, res) {
    const scopeId = req.query['scope-id'];
    const token = req.token;
    getScopesForToken(token)
        .then((scopes) => getIcs(scopes, scopeId))
        .then((icsString) => returnIcs(res, icsString))
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
});

function getIcs(scopes, scopeId) {
    return new Promise((resolve, reject) => {
        if (scopeId) {
            const scope = scopes.find(({id}) => id === scopeId);
            getEvents(scopeId)
                .then((events) => resolve(eventsToIcs(events, scope)))
                .catch(reject);
        } else {
            Promise.all(scopes.map(({id}) => getEvents(id)))
                .then((events) => resolve(eventsToIcs(flatten(events))))
                .catch(reject);
        }
    });

    function getEvents(scopeId) {
        const filter = { scopeId, all: true };
        return getEventsFromDb(filter);
    }
}

module.exports = router;
