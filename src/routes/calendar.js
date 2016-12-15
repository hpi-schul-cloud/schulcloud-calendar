const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

const allEventsForReferenceId = require('../queries/allEventsForReferenceId');
const queryToIcs = require('../parsers/queryToIcs');
const Readable = require('stream').Readable;

const getAllScopesForToken = require('../http_requests').getAllScopesForToken;

// GET /calendar/test
router.get('/test', function(req, res) {
    // TODO: get token from authentication header
    const token = 'student1_1';
    Promise.resolve(getAllScopesForToken(token))
        .then(getEventsForScopes.bind(null, res))
        .catch(function() {
            console.error('[GET /calendar/test] ERROR: ' + error);
            if (!res.headersSent) {
                res.status(500).send("Internal Server Error");
            }
        });
});

function getEventsForScopes(res, scopes) {
    const referenceIds = JSON.parse(scopes).data.map(function(entry) {
        return entry.id;
    });
    Promise.all(referenceIds.map(allEventsForReferenceId))
        .then(writeEventsIntoIcs.bind(null, res))
        .catch(function(error) {
            console.error('[GET /calendar/test:getEventsForScopes] ERROR: ' + error);
        })
}

function writeEventsIntoIcs(res, events) {
    var icsFile = new Readable();
    var contentLength = 0;
    events.forEach(function(event) {
        const ics = queryToIcs(event);
        icsFile.push(ics);
        contentLength += ics.length;
    });
    sendResponse(icsFile, contentLength, res);
}

function sendResponse(icsFile, contentLength, res) {
    icsFile.push(null);
    res.writeHead(200, {
        'Content-Disposition': 'attachment; filename=calendar.ics',
        'Content-Type': 'text/calendar', //application/octet-stream (?)
        'Content-Length': contentLength
    });
    icsFile.pipe(res);
}

module.exports = router;
