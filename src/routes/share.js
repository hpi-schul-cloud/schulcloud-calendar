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

router.options('/:shareToken', cors(corsOptions));

// GET /share/list
router.get('/list', authentication, function (req, res) {
    // TODO: implement
    handleError(res);
});

// GET /share/calendar/:shareToken
router.get('/calendar/:shareToken', function (req, res) {
    // TODO: implement
    handleError(res);
});

// POST /share/:scopeId
router.post('/:scopeId', authentication, function (req, res) {
    // TODO: implement
    handleError(res);
});

// DELETE /share/:shareToken
router.delete('/:shareToken', authentication, function (req, res) {
    // TODO: implement
    handleError(res);
});

// GET /share/:shareToken
router.get('/:shareToken', authentication, function (req, res) {
    // TODO: implement
    handleError(res);
});

module.exports = router;
