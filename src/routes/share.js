const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const cors = require('cors');
const config = require('../config');
const corsOptions = {
    origin: config.CORS_ORIGIN
};
router.use(cors(corsOptions));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// preprocessing
const authorize = require('../infrastructure/authorization');

// response
const returnError = require('../utils/response/returnError');

/* routes */

router.get('/share/list', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

router.get('/share/calendar/:shareToken', function (req, res) {
    // TODO: implement
    returnError(res);
});

router.get('/share/:shareToken', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

router.post('/share/:scopeId', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

router.delete('/share/:shareToken', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

module.exports = router;
