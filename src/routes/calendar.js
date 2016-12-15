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
    Promise.resolve(getAllScopesForToken(token)).then(
        getEventsForScopes.bind(null, res),
        function(error) {
            console.error('Error during GET request (all scopes for token).');
            console.error(error);
            if (!res.headersSent) {
                res.status(500).send("Internal Server Error");
            }
        });
});

function getEventsForScopes(res, scopes) {
    scopes = JSON.parse(scopes).data;
    const referenceIds = scopes.map(function(entry) {
        return entry.id;
    });
    Promise.all(referenceIds.map(allEventsForReferenceId)).then(
        writeEventsIntoIcs.bind(null, res, scopes),
        function(error) {
            console.error('Error during GET request (all events for reference id).');
            console.error(error);
        });
}

function writeEventsIntoIcs(res, scopes, queryResults) {
    var icsFile = new Readable();
    var contentLength = 0;
    queryResults.forEach(function(queryResult) {
        const event = queryResult.rows[0] || {};
        const scope = scopes.find(function(scope) {
            return scope.id === event.reference_id;
        });
        const ics = queryToIcs(queryResult, scope);
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
