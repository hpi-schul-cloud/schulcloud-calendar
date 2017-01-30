// Utilities
const returnError = require('./utils/returnError');

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
router.options('/:toDoId', cors(corsOptions));

// Routes

// POST /to-dos/ics
router.post('/', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

// PUT /to-dos/ics/:toDoId
router.put('/:toDoId', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

module.exports = router;
