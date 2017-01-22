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
const authorize = require("../authorization/index");

router.options('/:feedId', cors(corsOptions));

// GET /external-feed-subscription
router.get('/', authorize, function (req, res) {
    // TODO: implement
    handleError(res);
});

// POST /external-feed-subscription
router.post('/', authorize, function (req, res) {
    // TODO: implement
    handleError(res);
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

module.exports = router;
