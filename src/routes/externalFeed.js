// Services
const getScopesForRequest = require('../services/scopes/getScopesForRequest');

// Utilities
const returnError = require('./utils/returnError');
const returnSuccess = require('./utils/returnSuccess');

// Authorization
const authorize = require('../authorization/index');

// Project Configuration
const config = require('../config');

// Queries
const insertFeedSubscription = require('../queries/insertFeedSubscription');

// Logger
const logger = require('../logging/logger');

const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const cors = require('cors');

let corsOptions = {
    origin: config.CORS_ORIGIN
};
router.use(cors(corsOptions));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
router.options('/:feedId', cors(corsOptions));

// GET /external-feed-subscription/list
router.get('/list', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

// POST /external-feed-subscription
router.post('/', authorize, function (req, res) {
    handleInsertFeedRequest(req, res);
});

// PUT /external-feed-subscription/:feedId
router.put('/:feedId', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

// DELETE /external-feed-subscription/:feedId
router.delete('/:feedId', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

function handleInsertFeedRequest(req, res) {
    // TODO iterate over data array? Are multiple entries possible?
    // TODO: Yes, multiple events are allowed
    const data = req.body.data[0];
    getScopesForRequest(data)
        .then((scopeIds) => {
            const icsUrl = data.attributes['ics-url'];
            const description = data.attributes['description'];
            let feedIds = [];
            // Not a nice solution (see handleEnd)
            scopeIds.forEach((scopeId, index) => {
                insertFeedSubscription([icsUrl, description, scopeId])
                    .then((feedId) => {
                        feedIds = [...feedIds, feedId];
                        handleEnd(index);
                    })
                    .catch((error) => {
                        logger.error(error);
                        handleEnd(index);
                    });
            });

            function handleEnd(index) {
                if (index === scopeIds.length - 1) {
                    returnSuccess(res, feedIds);
                }
            }

        })
        .catch((error) => {
            returnError(res, error);
        });
}

module.exports = router;
