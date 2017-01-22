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

const allEvents = require('../queries/allEvents');
const queryToEventIcs = require('../parsers/queryToEventIcs');
const eventsToFinalIcs = require('../parsers/eventsToFinalIcs');
const Readable = require('stream').Readable;
const handleError = require('./utils/handleError');

const getAllScopesForToken = require('../http_requests').getAllScopesForToken;
const getRepeatExceptionsIcsForEvent = require('../queries/getRepeatExceptionForEvent').getRepeatExceptionsIcsForEvent;
const getAlarmsIcsForEvent = require('../queries/allAlarmsForEvent').getAlarmsIcsForEvent;

// GET /calendar/test
router.get('/test', function (req, res) {
    // TODO: get token from authentication header
    const token = 'student1_1';
    Promise.resolve(getAllScopesForToken(token)).then(
        getEventsForScopes.bind(null, res),
        handleError.bind(null, res)
    );
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

function getEventsForScopes(res, scopes) {
    scopes = JSON.parse(scopes).data;
    const referenceIds = scopes.map(function (entry) {
        return entry.id;
    });
    var referenceIdPromises = [];
    for (var i = 0; i < referenceIds.length; i++) {
        referenceIdPromises.push(allEvents(referenceIds[i]));
    }
    Promise.all(referenceIdPromises).then(
        writeEventsIntoIcs.bind(null, res, scopes),
        handleError.bind(null, res)
    );
}

function writeEventsIntoIcs(res, scopes, queryResults) {
    const icsFile = [];
    const queryPromises = [];
    queryResults.forEach(function (queryResult) {
        queryResult.rows.forEach(function (event) {
            if (event == null)
                return;
            // TODO: remove when new API has been introduced and each link/request is for only one scope
            // const scope = scopes.find(function (scope) {
            //     return scope.id === event.reference_id;
            // });
            queryPromises.push(getEvent(res, event, icsFile));
        });
    });
    Promise.all(queryPromises).then(
        sendResponse.bind(null, icsFile, res),
        handleError.bind(null, res)
    );
}

function getEvent(res, event, icsFile) {
    return new Promise(function (resolve, reject) {
        const exdates = {};
        const alarms = {};
        const eventPromises = [];
        eventPromises.push(catchExdates(res, event, exdates));
        eventPromises.push(catchAlarms(res, event, alarms));
        Promise.all(eventPromises).then(
            createAndAddEventIcs.bind(null, event, icsFile, exdates, alarms, resolve),
            handleError.bind(null, res)
        );
    });
}

function createAndAddEventIcs(event, icsFile, exdates, alarms, resolve) {
    const ics = queryToEventIcs(event, exdates, alarms);
    icsFile.push(ics);
    resolve();
}

function catchExdates(res, event, exdates) {
    return new Promise(function (resolve, reject) {
        Promise.resolve(getRepeatExceptionsIcsForEvent(event.id)).then(
            resolveExdates.bind(null, resolve, event, exdates),
            handleError.bind(null, res)
        );
    });

}

function resolveExdates(resolve, event, exdates, exdatesResult) {
    exdates[event.id] = exdatesResult;
    resolve();
}

function catchAlarms(res, event, alarms) {
    return new Promise(function (resolve, reject) {
        Promise.resolve(getAlarmsIcsForEvent(event.id)).then(
            resolveAlarms.bind(null, resolve, event, alarms),
            handleError.bind(null, res)
        );
    });
}

function resolveAlarms(resolve, event, alarms, alarmsResult) {
    alarms[event.id] = alarmsResult;
    resolve();
}

function sendResponse(icsFile, res) {
    // TODO: after introducing new API, only one scope will be put into ics file, then set the correct scope here
    const scope = '';
    let finalIcsString = eventsToFinalIcs(icsFile, scope);
    const finalIcs = new Readable();
    finalIcs.push(finalIcsString);
    finalIcs.push(null);
    res.writeHead(200, {
        'Content-Disposition': 'attachment; filename=calendar.ics',
        'Content-Type': 'text/calendar', //application/octet-stream (?)
        'Content-Length': finalIcsString.length
    });
    finalIcs.pipe(res);
}

module.exports = router;
