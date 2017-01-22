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
const authentication = require("../authorization/index");

router.options('/:toDoId', cors(corsOptions));

// GET /to-dos
router.get('/', authentication, function (req, res) {
    // TODO: implement
    handleError(res);
});

// POST /to-dos
router.post('/', authentication, function (req, res) {
    // TODO: implement
    handleError(res);
});

// PUT /to-dos/:toDoId
router.put('/:toDoId', authentication, function (req, res) {
    // TODO: implement
    handleError(res);
});

// DELETE /to-dos/:toDoId
router.delete('/:toDoId', authentication, function (req, res) {
    // TODO: implement
    handleError(res);
});

module.exports = router;
