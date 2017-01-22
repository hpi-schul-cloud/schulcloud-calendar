const express = require('express');
const bodyParser = require('body-parser');
const uuidV4 = require('uuid/v4');
const router = express.Router();

const cors = require('cors');
let corsOptions = {
    origin: 'https://schulcloud.github.io'
};
router.use(cors(corsOptions));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

const icsToJson = require('../parsers/icsToJson');
const insertEvents = require('../queries/insertEvents');
const getAllUsersForUUID = require('../http_requests').getAllUsersForUUID;
const handleSuccess = require('./utils/handleSuccess');
const handleError = require('./utils/handleError');
const consoleError = require('../utils/consoleError');
const addRepeatExceptionToEvent = require('../queries/addRepeatExceptionToEvent');
const addAlarmToEvent = require('../queries/addAlarmToEvent');
const handleDeleteRequest = require("./utils/handleDeleteRequest");
const authorize = require("../authorization/index");

router.post('/', authorize, function (req, res) {
    handleInsertRequest(req, res, uuidV4());
});

router.put('/:eventId', authorize, function (req, res) {
    // TODO: Validate operation (e.g. don't create event if id couldn't be find, ...)
    handleDeleteRequest(req, null);
    handleInsertRequest(req, res, req.params.eventId);
});

function handleInsertRequest(req, res, externalEventId) {
    const scopeIds = req.body.scopeIds;
    if (!Array.isArray(scopeIds) || scopeIds.length === 0) {
        consoleError("Got invalid 'scopeIds' array!");
        handleError(res);
        return;
    }
    const separateUsers = req.body.separateUsers;
    const ics = req.body.ics;
    const json = icsToJson(ics);
    if (!json) {
        handleError(res);
        return;
    }

    if (Array.isArray(json)) {
        json.forEach(function(event) {
            handleJson(event, separateUsers, scopeIds, externalEventId, req, res);
        });
    } else {
        handleJson(json, separateUsers, scopeIds, externalEventId, req, res);
    }
}

function handleJson(json, separateUsers, scopeIds, externalEventId, req, res) {
    /*
     * json contains id, summary, location, description, start_timestamp, end_timestamp
     * reference_id, created_timestamp, last_modified_timestamp, repeat, repeat_interval, alarms Array
     */
    var params = [];
    var referenceIds;
    params[0] = json["summary"];            //$1: summary
    params[1] = json["location"];           //$2: location
    params[2] = json["description"];        //$3: description
    params[3] = json["start_timestamp"];    //$4: start_timestamp
    params[4] = json["end_timestamp"];      //$5: end_timestamp
    params[6] = new Date();                 //$7: created_timestamp
    params[7] = json["repeat"];             //$8: repeat
    params[8] = json["repeat_interval"];    //$9: repeat_interval
    params[9] = json["repeat_byday"];      //$10: repeat_byday
    params[10] = externalEventId;          //$11: event_id

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
