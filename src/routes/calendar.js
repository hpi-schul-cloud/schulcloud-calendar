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

const getEventsForToken = require('../services/events/getEventsForToken');
const Readable = require('stream').Readable;
const handleError = require('./utils/handleError');
const getIcsWithEventsForToken = require('../services/ics/getIcsWithEventsForToken');

// GET /calendar/test
router.get('/test', function (req, res) {
    // TODO: get token from authentication header
    const token = 'student1_1';
    Promise.resolve(getIcsWithEventsForToken(token)).then(
        function (finalIcsString) {
            const finalIcs = new Readable();
            finalIcs.push(finalIcsString);
            finalIcs.push(null);
            res.writeHead(200, {
                'Content-Disposition': 'attachment; filename=calendar.ics',
                'Content-Type': 'text/calendar', //application/octet-stream (?)
                'Content-Length': finalIcsString.length
            });
            finalIcs.pipe(res);
    },
    handleError.bind(null, res));
});

// GET /calendar
router.get('/', function (req, res) {
    // TODO: implement
    handleError(res);
});

// GET /calendar/list
router.get('/list', function (req, res) {
    // TODO: implement
    handleError(res);
});

module.exports = router;
