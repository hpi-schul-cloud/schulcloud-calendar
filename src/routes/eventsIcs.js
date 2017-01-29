// Utilities
const handleSuccess = require('./utils/returnSuccess');
const handleError = require('./utils/returnError');
const consoleError = require('../utils/consoleError');
const handleDeleteRequest = require("./utils/handleDeleteRequest");

// Parsers
const icsToJson = require('../parsers/icsToJson');

// Queries
const insertEvents = require('../queries/insertEvents');
const addRepeatExceptionToEvent = require('../queries/addRepeatExceptionToEvent');
const addAlarmToEvent = require('../queries/addAlarmToEvent');

// HTTP Requests
const getAllUsersForUUID = require('../http-requests').getAllUsersForUUID;
const newNotificationForScopeIds = require('../http-requests/newNotificationForScopeIds');

// Authorization
const authorize = require("../authorization/index");

// Project Configuration
const config = require('../config');

// Imports
const express = require('express');
const bodyParser = require('body-parser');
const uuidV4 = require('uuid/v4');
const router = express.Router();

// Configuration
const cors = require('cors');
let corsOptions = {
    origin: config.CORS_ORIGIN
};
router.use(cors(corsOptions));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

//Routes

router.post('/', authorize, icsToJson, function (req, res) {
    handleInsertRequest(req, res, uuidV4());

    //TODO: only, if created successful
    const scopeIds = req.body.scopeIds;
    const title = "Neuer Termin erstellt";
    const body = "Es wurde ein neuer Termin für Sie erstellt!";
    newNotificationForScopeIds(title, body, req.token, scopeIds);
});

router.put('/:eventId', authorize, icsToJson, function (req, res) {
    // TODO: Validate operation (e.g. don't create event if id couldn't be find, ...)
    handleDeleteRequest(req, null);
    handleInsertRequest(req, res, req.params.eventId);

    //TODO: only, if modified successful
    const scopeIds = req.body.scopeIds;
    const title = "Ein Termin wurde verändert";
    const body = "Einer Ihrer Termine wurde verändert!";
    newNotificationForScopeIds(title, body, req.token, scopeIds);
});

function handleInsertRequest(req, res, externalEventId) {
    req.events.forEach(function(event) {
        // TODO: Move to validation
        if (!Array.isArray(event.scopeIds) || event.scopeIds.length === 0) {
            consoleError("Got invalid 'scopeIds' array!");
            handleError(res);
        } else {
            handleJson(event, event.separateUsers, event.scopeIds, externalEventId, req, res);
        }
    });
}

function handleJson(json, separateUsers, scopeIds, externalEventId, req, res) {
    /*
     * json contains id, summary, location, description, dtstart, dtend
     * reference_id, dtstamp, last-modified, repeat, repeat_interval, alarms Array
     */
    var params = [];
    var referenceIds;
    params[0] = json["summary"];            //$1: summary
    params[1] = json["location"];           //$2: location
    params[2] = json["description"];        //$3: description
    params[3] = json["dtstart"];            //$4: dtstart
    params[4] = json["dtend"];              //$5: dtend
    params[6] = new Date();                 //$7: dtstamp
    params[7] = json["repeat_freq"];        //$8: repeat_freq
    params[8] = json["repeat_until"];       //$9: repeat_until
    params[9] = json["repeat_count"];       //$10: repeat_count
    params[10] = json["repeat_interval"];   //$11: repeat_interval
    params[11] = json["repeat_bysecond"];   //$12: repeat_bysecond
    params[12] = json["repeat_byminute"];   //$13: repeat_byminute
    params[13] = json["repeat_byhour"];     //$14: repeat_byhour
    params[14] = json["repeat_byday"];      //$15: repeat_byday
    params[15] = json["repeat_bymonthday"]; //$16: repeat_bymonthday
    params[16] = json["repeat_byyearday"];  //$17: repeat_byyearday
    params[17] = json["repeat_byweekno"];   //$18: repeat_byweekno
    params[18] = json["repeat_bymonth"];    //$19: repeat_bymonth
    params[19] = json["repeat_bysetpos"];   //$20: repeat_bysetpos
    params[20] = json["repeat_wkst"];       //$21: repeat_wkst
    params[21] = externalEventId;          //$22: event_id

    if (separateUsers === true) {
        scopeIds.forEach(function(scopeId) {
            Promise.resolve(getAllUsersForUUID(scopeId)).then(
                insertSeparateEvents.bind(null, res, params),
                handleError.bind(null, res)
            );
        });
    } else {
        Promise.resolve(insertEvents(params, scopeIds))
            .then(function (results) {
                // TODO: check if result is uuid
                if (Array.isArray(results)) {
                    // check if exception dates for possible repeat exist
                    // TODO: if so, check if repeat is set because of consistency reasons...
                    if (Array.isArray(json["exdate"])) {
                        const exdates = json["exdate"];
                        for (var i = 0; i < exdates.length; i++) {
                            for (var j = 0; j < results.length; j++) {
                                var params = [];
                                params[0] = results[j].id;
                                params[1] = exdates[i];
                                addRepeatExceptionToEvent(params);
                            }
                        }
                    }
                    if (Array.isArray(json["alarms"])) {
                        json["alarms"].forEach(function(alarm) {
                            results.forEach(function(createdEvent) {
                                let params = [];
                                params[0] = createdEvent.id;
                                params[1] = alarm["trigger"];
                                params[2] = alarm["repeat"];
                                params[3] = alarm["duration"];
                                params[4] = alarm["action"];
                                params[5] = alarm["attach"];
                                params[6] = alarm["description"];
                                params[7] = alarm["attendee"];
                                params[8] = alarm["summary"];
                                addAlarmToEvent(params);
                            });
                        });
                    }
                }

                handleSuccess(res, results[0].event_id);
        }, handleError.bind(null, res));
    }
}

function insertSeparateEvents(res, params, response) {
    const responseJson = JSON.parse(response);
    const result = responseJson.data;

    if(!Array.isArray(result)) {
        consoleError("Got invalid server response (expected an array of scopeIds)");
        return;
    }

    const referenceIds = result.map(function(entry) {
        return entry.id;
    });

    // TODO: This is not going to add alarms and exdates!

    Promise.resolve(insertEvents(params, referenceIds)).then(
        handleSuccess.bind(null, res),
        handleError.bind(null, res)
    );
}

module.exports = router;
