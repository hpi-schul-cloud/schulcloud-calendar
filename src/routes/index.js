
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const cors = require('cors');
const authorize = require('../infrastructure/authorization');

// Configuration
const config = require('../config');
let corsOptions = {
    origin: config.CORS_ORIGIN
};
router.use(cors(corsOptions));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// Utilities
const returnError = require('./utils/returnError');
const returnSuccess = require('./utils/returnSuccess');
const returnICalendar = require('./utils/returnICalendar');

// Handlers
const getCalendar = require('./handlers/calendar').get;
const getCalendarList = require('./handlers/calendar').list;

/* Routes */

router.get('/system-info/haproxy', function (req, res) {
    res.send({'timestamp': new Date().getTime()});
});

router.get('/ping', function (req, res) {
    res.send({'message': 'pong', 'timestamp': new Date().getTime()});
});

router.get('/calendar/list', authorize, function (req, res) {
    const token = req.token;
    Promise.resolve(getCalendarList(token))
        .then((calendarList) => { returnSuccess(res, calendarList); })
        .catch((error) => { returnError(res, error); });
});

router.get('/calendar', authorize, function (req, res) {
    const scopeId = req.get('scope-id');
    const token = req.token;
    Promise.resolve(getCalendar(scopeId, token))
        .then((icsString) => { returnICalendar(res, icsString); })
        .catch((error) => { returnError(res, error); });
});

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
