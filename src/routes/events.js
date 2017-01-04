const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

const icsToJson = require('../parsers/icsToJson');
const insertEventsWithReferenceIds = require('../queries/insertEventsWithReferenceIds');
const deleteEvent = require('../queries/deleteEvent');
const getAllUsersForUUID = require('../http_requests').getAllUsersForUUID;
const handleSuccess = require('./utils/handleSuccess')
const handleError = require('./utils/handleError')

router.post('/', function (req, res) {
    const scopeIds = req.body.scopeIds;
    if (!Array.isArray(scopeIds) || scopeIds.length === 0) {
        console.error("Got invalid 'scopeIds' array!");
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
            handleJson(event, separateUsers, scopeIds, req, res);
        });
    } else {
        handleJson(json, separateUsers, scopeIds, req, res);
    }

});

router.put('/:id', function (req, res) {
    // TODO implement
    var scopeIds = req.body.scopeIds;
    var separateUsers = req.body.separateUsers;
    var ics = req.body.ics;
    var id = req.params.id;
});

router.delete('/:id', function (req, res) {
    // TODO implement with scopeIds
    var id = req.params.id;
    Promise.resolve(deleteEvent([id])).then(
        handleSuccess.bind(null, res),
        handleError.bind(null, res)
    );
});

function handleJson(json, separateUsers, scopeIds, req, res) {
    /*
     * json contains id, summary, location, description, start_timestamp,
     * end_timestamp, reference_id, created_timestamp, last_modified_timestamp
     */
    var params = [];
    var referenceIds;
    params[0] = json["summary"];            //$1: summary
    params[1] = json["location"];           //$2: location
    params[2] = json["description"];        //$3: description
    params[3] = json["start_timestamp"];    //$4: start_timestamp
    params[4] = json["end_timestamp"];      //$5: end_timestamp
    params[6] = new Date();                 //$7: created_timestamp

    if (separateUsers === true) {
        Promise.resolve(getAllUsersForUUID(scopeIds[0])).then(
            insertSeparateEvents.bind(null, res),
            handleError.bind(null, res)
        );
    } else {
        referenceIds = [scopeIds[0]];
        Promise.resolve(insertEventsWithReferenceIds(params, referenceIds)).then(
            handleSuccess.bind(null, res),
            handleError.bind(null, res)
        );
    }
}

function insertSeparateEvents(res, response) {
    const responseJson = JSON.parse(response);
    const result = responseJson.data;

    if(!Array.isArray(result)) {
        console.error("Got invalid server response (expected an array of scopeIds)");
        return;
    }

    referenceIds = result.map(function(entry) {
        return entry.id;
    })

    Promise.resolve(insertEventsWithReferenceIds(params, referenceIds)).then(
        handleSuccess.bind(null, res),
        handleError.bind(null, res)
    );
}

module.exports = router;
