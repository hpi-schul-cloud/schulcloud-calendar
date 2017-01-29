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
router.options('/:toDoId', cors(corsOptions));

// Routes

// GET /to-dos
router.get('/', authorize, function (req, res) {
    // TODO: implement
    handleError(res);
});

// POST /to-dos
router.post('/', authorize, function (req, res) {
    // TODO: implement
    handleError(res);
});

// PUT /to-dos/:toDoId
router.put('/:toDoId', authorize, function (req, res) {
    // TODO: implement
    handleError(res);
});

// DELETE /to-dos/:toDoId
router.delete('/:toDoId', authorize, function (req, res) {
    // TODO: implement
    handleError(res);
});

module.exports = router;
