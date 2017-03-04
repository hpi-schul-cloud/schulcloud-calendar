// Services
const getScopesForToken = require('../services/scopes/getScopesForToken');
const getIcsWithEventsForScopes = require('../services/ics/getIcsWithEventsForScopes');
const getCalendarListOutput = require('../services/to-json-api/getCalendarList');

// Utilities
const returnError = require('./utils/returnError');
const returnSuccess = require('./utils/returnSuccess');
const returnICalendar = require('./utils/returnICalendar');

// Authorization
const authorize = require('../infrastructure/authorization');

// Project Configuration
const config = require('../config');

// Imports
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const cors = require('cors');

//Handlers
const getCalendar = require('./handlers/getCalendar');

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
        returnError.bind(null, res)
    );
});

// GET /calendar
router.get('/', authorize, function (req, res) {
    Promise.resolve(getScopeIds(req))
        .then(
            (scopeIds) => {
                getCalendar(scopeIds);
            }
        )
        .catch(
            (error) => {
                returnError(res, error);
            }
        );

    function getScopeIds(req) {
        return new Promise((resolve, reject) => {
            const scopeId = req.get('scope-id');
            if(scopeId) {
                resolve([scopeId]);
            }
            Promise.resolve(getScopesForToken(req.token))
                .then(
                    (scopes) => {
                        const scopeIds = scopes.map((scope) => {
                            return scope.id;
                        });
                        resolve(scopeIds);
                    }
                )
                .catch(
                    (error) => {
                        returnError(res, error);
                    }
                );
        })
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
