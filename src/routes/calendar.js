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

// authentication, authorization and preprocessing
const { authenticateFromHeaderField, authenticateFromQueryParameter } = require('../security/authentication');
const { authorizeAccessToScopeId } = require('../security/authorization');

// response
const returnError = require('../utils/response/returnError');
const returnSuccess = require('../utils/response/returnSuccess');
const returnIcs = require('../utils/response/returnIcs');

// content
const scopesToCalendarList = require('../parsers/calendar/scopesToCalendarList');
const getEventsFromDb = require('../services/events/getEvents');
const flatten = require('../utils/flatten');
const eventsToIcs = require('../parsers/event/eventsToIcs');

/* routes */

router.get('/calendar/list', authenticateFromHeaderField, function (req, res) {
    const user = req.user;
    const token = req.token;

    scopesToCalendarList(user.scope, token)
        .then((calendarList) => returnSuccess(res, 200, calendarList))
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
});

router.get('/calendar', authenticateFromQueryParameter, function (req, res) {
    const scopeId = req.query['scope-id'];
    const user = req.user;
    const token = req.token;

    authorizeAccessToScopeId(user, scopeId)
        .then(() => getIcs(user.scope, scopeId))
        .then((icsString) => returnIcs(res, icsString))
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
});

function getIcs(scopes, scopeId) {
    return new Promise((resolve, reject) => {
        if (scopeId) {
            const scope = scopes[scopeId];
            getEvents(scopeId)
                .then((events) => resolve(eventsToIcs(events, scope)))
                .catch(reject);
        } else {
            Promise.all(Object.keys(scopes).map((id) => getEvents(id)))
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
