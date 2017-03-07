const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const cors = require('cors');

// configuration
const config = require('../config');
const corsOptions = {
    origin: config.CORS_ORIGIN
};
router.use(cors(corsOptions));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// preprocessing
const authorize = require('../infrastructure/authorization');
const jsonApiToJson = require('../parsers/subscription/jsonApiToJson');

// response
const returnError = require('./utils/returnError');
const returnSuccess = require('./utils/returnSuccess');

// content
const insertSubscription = require('../queries/insertSubscription');
const scopeIdsForSeparateUsers = require('../services/scopes/scopeIdsForSeparateUsers');

/* routes */

router.get('/subscription/list', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

router.post('/subscription', authorize, jsonApiToJson, function (req, res) {
    // We only allow one subscribtion per request
    const { icsUrl, description, scopeIds, separateUsers } = req.subscription;
    Promise.resolve(scopeIdsForSeparateUsers(scopeIds, separateUsers))
        .then((scopeIds) => {
            return insertSubscriptions(scopeIds, icsUrl, description);
        })
        .then((subscriptionIds) => { returnSuccess(res, subscriptionIds); })
        .catch((error) => returnError(error));

    function insertSubscriptions(scopeIds, icsUrl, description) {
        return Promise.all(scopeIds.map((scopeId) => {
            return insertSubscription([icsUrl, description, scopeId]);
        }));
    }
});

router.put('/subscription/:feedId', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

router.delete('/subscription/:feedId', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

module.exports = router;
