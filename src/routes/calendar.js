// Services
const getScopesForToken = require('../services/scopes/getScopesForToken');
const getCalendarListOutput = require('../services/to-json-api/getCalendarList');
const getCalendar = require('../services/calendar/getCalendar');

// Utilities
const returnError = require('./utils/returnError');
const returnSuccess = require('./utils/returnSuccess');
const returnICalendar = require('./utils/returnICalendar');

// Authorization
const authorize = require('../authorization/index');

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

// GET /calendar
router.get('/', authorize, function (req, res) {
    Promise.resolve(getScopeIds(req))
        .then((scopeIds) => {
            return Promise.resolve(getCalendar(scopeIds));
        })
        .then((icsString) => { returnICalendar(res, icsString); })
        .catch((error) => { returnError(res, error); });

    function getScopeIds(req) {
        return new Promise((resolve, reject) => {
            const scopeId = req.get('scope-id');
            if (scopeId) {
                resolve([scopeId]);
            }
            Promise.resolve(getScopesForToken(req.token))
                .then(
                    (scopes) => {
                        const scopeIds = scopes.map(({id}) => id);
                        resolve(scopeIds);
                    }
                )
                .catch((error) => { reject(error); });
        });
    }

});

// GET /calendar/list
router.get('/list', authorize, function (req, res) {
    // TODO: Reuse req.user
    Promise.resolve(getScopesForToken(req.token))
        .then(
            (scopes) => {
                returnSuccess(res, getCalendarListOutput(scopes));
            }
        )
        .catch(
            (error) => {
                returnError(res, error);
            }
        );
});

module.exports = router;
