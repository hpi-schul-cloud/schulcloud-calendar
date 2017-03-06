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
const returnError = require('./utils/returnError');

/* routes */

router.get('/to-dos', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

router.post('/to-dos', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

router.post('/to-dos/ics', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

router.put('/to-dos/:toDoId', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

router.put('/to-dos/ics/:toDoId', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

router.delete('/to-dos/:toDoId', authorize, function (req, res) {
    // TODO: implement
    returnError(res);
});

module.exports = router;
