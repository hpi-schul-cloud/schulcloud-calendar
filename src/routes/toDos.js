// Utilities
const returnError = require('./utils/returnError');

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
router.options('/:toDoId', cors(corsOptions));

// Routes

// GET /to-dos
router.get('/', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

// POST /to-dos
router.post('/', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

// PUT /to-dos/:toDoId
router.put('/:toDoId', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

// DELETE /to-dos/:toDoId
router.delete('/:toDoId', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

module.exports = router;
