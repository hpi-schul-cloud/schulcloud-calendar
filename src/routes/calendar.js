const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

const allEvents = require('../queries/allEvents');
const queryToIcs = require('../parsers/queryToIcs');
const Readable = require('stream').Readable;
const handleError = require('./utils/handleError')

const getAllScopesForToken = require('../http_requests').getAllScopesForToken;
const getRepeatExceptionsIcsForEvent = require('../queries/getRepeatExceptionForEvent').getRepeatExceptionsIcsForEvent;
const getAlarmsIcsForEvent = require('../queries/allAlarmsForEvent').getAlarmsIcsForEvent;

// GET /calendar/test
router.get('/test', function(req, res) {
    // TODO: get token from authentication header
    // console.error("called /test")
    const token = 'student1_1';
    Promise.resolve(getAllScopesForToken(token)).then(
        getEventsForScopes.bind(null, res),
        handleError.bind(null, res)
    );
});

function getEventsForScopes(res, scopes) {
    // console.error("get Events for Scopes");
    scopes = JSON.parse(scopes).data;
    const referenceIds = scopes.map(function(entry) {
        return entry.id;
    });
    var referenceIdPromises = [];
    for (var i = 0; i < referenceIds.length; i++) {
        referenceIdPromises.push(allEvents(referenceIds[i]));
    }
    Promise.all(referenceIdPromises).then(
        writeEventsIntoIcs.bind(null, res, scopes),
        // handleError.bind(null, res)
        function (error) {
            console.error("Error in Promise.all")
        }
    );
}

function writeEventsIntoIcs(res, scopes, queryResults) {
    // console.error("Write Events into Ics");
    const icsFile = [];
    const queryPromises = [];
    // need objects here to pass it by reference, not by value
    const contentLength = {length: 0};
    const exdates = {exdates: null};
    const alarms = {alarms: null};
    queryResults.forEach(function(queryResult) {
        if (queryResult.rows[0] == null)
            return;
        const event = queryResult.rows[0] || {};
        // console.log("event: " + JSON.stringify(event));
        const scope = scopes.find(function(scope) {
            return scope.id === event.reference_id;
        });
        queryPromises.push(catchExdates(res, scope, queryResult, event, icsFile, contentLength, exdates, alarms));
    });
    Promise.all(queryPromises).then(
        // sendResponse.bind(null, icsFile, contentLength, res),
        // handleError.bind(null, res)
        function (success) {
            console.error("all queryPromises successful");
            sendResponse(icsFile, contentLength, res);
        }, function (error) {
            console.error("error in queryPromises");
            console.error(error);
        }
    );
}

function catchExdates(res, scope, queryResult, event, icsFile, contentLength, exdates, alarms) {
    return new Promise(function (resolve, reject) {
        console.error("catch Exdates");
        Promise.resolve(getRepeatExceptionsIcsForEvent(event.id)).then(
            resolveExdates.bind(null, res, resolve, reject, scope, queryResult, event, icsFile, contentLength, exdates, alarms),
            // handleError.bind(null, res)
            function (error) {
                console.error("Error in catchExdates");
                console.error(error);
            }
        );
    });

}

function resolveExdates(res, resolve, reject, scope, queryResult, event, icsFile, contentLength, exdates, alarms, exdatesResult) {
    // console.error("resolve Exdates " + exdatesResult);
    exdates.exdates = exdatesResult;
    catchAlarms(res, resolve, reject, scope, queryResult, event, icsFile, contentLength, exdates, alarms);
}

function catchAlarms(res, resolve, reject, scope, queryResult, event, icsFile, contentLength, exdates, alarms) {
    Promise.resolve(getAlarmsIcsForEvent(event.id)).then(
        resolveAlarms.bind(null, res, resolve, reject, scope, queryResult, event, icsFile, contentLength, exdates, alarms),
        handleError.bind(null, res)
    );
}

function resolveAlarms(res, resolve, reject, scope, queryResult, event, icsFile, contentLength, exdates, alarms, alarmsResult) {
    // console.error("resolve alarms " + alarmsResult);
    alarms.alarms = alarmsResult;
    createAndAddIcs(res, resolve, reject, scope, queryResult, event, icsFile, contentLength, exdates, alarms)
}

function createAndAddIcs(res, resolve, reject, scope, queryResult, event, icsFile, contentLength, exdates, alarms) {
    const ics = queryToIcs(queryResult, scope, exdates, alarms);
    icsFile.push(ics);
    contentLength.length += ics.length;
    console.error("finished ics");
    resolve();
}

function sendResponse(icsFile, contentLength, res) {
    let finalIcsString = "";
    icsFile.forEach(function (entry) {
        finalIcsString += entry;
    });
    const finalIcs = new Readable();
    console.error("sendResponse");
    finalIcs.push(finalIcsString);
    finalIcs.push(null);
    console.error("icsFile.push(null) successful");
    res.writeHead(200, {
        'Content-Disposition': 'attachment; filename=calendar.ics',
        'Content-Type': 'text/calendar', //application/octet-stream (?)
        'Content-Length': contentLength.length
    });
    console.error("writeHead successful");
    finalIcs.pipe(res);
    console.error("pipe successful");
}

module.exports = router;
