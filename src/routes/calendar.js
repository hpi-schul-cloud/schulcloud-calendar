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

// content
const getScopesForToken = require('../services/getScopesForToken');
const scopesToCalendarList = require('../parsers/calendar/scopesToCalendarList');
const getScopeIdsForToken = require('../services/getScopeIdsForToken');
const getEvents = require('../services/getEvents');
const flatten = require('../utils/flatten');
const eventsToJsonApi = require('../parsers/event/eventsToJsonApi');

/* routes */

router.get('/calendar/list', authorize, function (req, res) {
    const token = req.get('Authorization');
    getScopesForToken(token)
        .then(scopesToCalendarList)
        .then((calendarList) => { returnSuccess(res, 200, calendarList); })
        .catch((error) => { returnError(res, error); });
});

router.get('/calendar', authorize, function (req, res) {
    const scopeId = req.query['scope-id'];
    const token = req.get('Authorization');
    getScopeIdsForToken(token, scopeId)
        .then(getJsonApi)
        .then((jsonApiString) => { returnSuccess(res, 200, jsonApiString); })
        .catch((error) => { returnError(res, error); });
});

function getJsonApi(scopeIds) {
    return new Promise((resolve, reject) => {
        Promise.all(scopeIds.map((scopeId) => {
            const filter = { scopeId, all: true };
            return getEvents(filter);
        }))
            .then((events) => {
                resolve(eventsToJsonApi(flatten(events)));
            })
            .catch(reject);
    });
}

module.exports = router;
