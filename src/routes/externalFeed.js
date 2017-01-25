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

const handleError = require('./utils/handleError');
const handleSuccess = require('./utils/handleSuccess');
const authorize = require("../authorization/index");
const insertFeedSubscription = require('../queries/insertFeedSubscription');

router.options('/:feedId', cors(corsOptions));

// GET /external-feed-subscription/list
router.get('/list', authorize, function (req, res) {
    // TODO: implement
    handleError(res);
});

// POST /external-feed-subscription
router.post('/', authorize, function (req, res) {
    handleFeedInsertRequest(req, res);
});

// PUT /external-feed-subscription/:feedId
router.put('/:feedId', authorize, function (req, res) {
    // TODO: implement
    handleError(res);
});

// DELETE /external-feed-subscription/:feedId
router.delete('/:feedId', authorize, function (req, res) {
    // TODO: implement
    handleError(res);
});

function handleFeedInsertRequest(req, res) {
    const data = req.body.data;
    const relationships = req.body.relationships;
    const scopeIds = relationships.scopeIds;
    if (!Array.isArray(scopeIds) || scopeIds.length === 0) {
        consoleError("Got invalid 'scopeIds' array!");
        handleError(res);
        return;
    }
    const params = [
        data.attributes['ics-url'],
        data.attributes['description'],
        relationships['scope-ids'],
        relationships['separate-users']
    ];
    Promise.resolve(insertFeedSubscription(params)).then(
      // TODO return id
      handleSuccess.bind(null, res),
      handleError.bind(null, res)
    );
}

module.exports = router;
