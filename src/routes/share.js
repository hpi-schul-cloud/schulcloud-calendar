// Utilities
const handleError = require('./utils/returnError');

// Authorization
const authorize = require("../authorization/index");

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
router.options('/:shareToken', cors(corsOptions));

// Routes

// GET /share/list
router.get('/list', authorize, function (req, res) {
    // TODO: implement
    handleError(res);
});

// GET /share/calendar/:shareToken
router.get('/calendar/:shareToken', function (req, res) {
    // TODO: implement
    handleError(res);
});

// POST /share/:scopeId
router.post('/:scopeId', authorize, function (req, res) {
    // TODO: implement
    handleError(res);
});

// DELETE /share/:shareToken
router.delete('/:shareToken', authorize, function (req, res) {
    // TODO: implement
    handleError(res);
});

// GET /share/:shareToken
router.get('/:shareToken', authorize, function (req, res) {
    // TODO: implement
    handleError(res);
});

module.exports = router;
