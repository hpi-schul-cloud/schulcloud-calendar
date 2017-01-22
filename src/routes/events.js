const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const cors = require('cors');
let corsOptions = {
    origin: 'https://schulcloud.github.io'
};
router.use(cors(corsOptions));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

const handleDeleteRequest = require("./utils/handleDeleteRequest");
const authentication = require("../authorization/index");

router.options('/:eventId', cors(corsOptions));

// DELETE /events/:eventId
router.delete('/:eventId', authentication, function (req, res) {
    handleDeleteRequest(req, res);
});

// GET /events/
router.get('/', authentication, function (req, res) {
    // TODO: implement
    handleError(res);
});

// POST /events/
router.post('/', authentication, function (req, res) {
    // TODO: implement
    handleError(res);
});

// PUT /events/:eventId
router.put('/:eventId', authentication, function (req, res) {
    // TODO: implement
    handleError(res);
});

module.exports = router;
