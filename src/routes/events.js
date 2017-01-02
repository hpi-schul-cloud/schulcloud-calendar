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
    const ids = req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
        console.error("Got invalid 'ids' array!");
        handleError(res);
        return;
    }
    const seperate = req.body.seperate;
    const ics = req.body.ics;
    const json = icsToJson(ics);
    if (!json) {
        handleError(res);
        return;
    }

    if (Array.isArray(json)) {
        json.forEach(function(event) {
            handleJson(event, seperate, ids, req, res);
        });
    } else {
        handleJson(json, seperate, ids, req, res);
    }

});

router.put('/:id', function (req, res) {
    // TODO implement
    var ids = req.body.ids;
    var seperate = req.body.seperate;
    var ics = req.body.ics;
    var id = req.params.id;
});

router.delete('/:id', function (req, res) {
    var id = req.params.id;
    Promise.resolve(deleteEvent([id])).then(
        handleSuccess.bind(null, res),
        handleError.bind(null, res)
    );
});

function handleJson(json, seperate, ids, req, res) {
    /*
     * json contains id, summary, location, description, start_timestamp,
     * end_timestamp, reference_id, created_timestamp, last_modified_timestamp, repeat, repeat_interval
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

    if (seperate === true) {
        Promise.resolve(getAllUsersForUUID(ids[0])).then(
            insertSeperateEvents.bind(null, res),
            handleError.bind(null, res)
        );
    } else {
        referenceIds = [ids[0]];
        Promise.resolve(insertEventsWithReferenceIds(params, referenceIds)).then(
            handleSuccess.bind(null, res),
            handleError.bind(null, res)
        );
    }
}

function insertSeperateEvents(res, response) {
    const responseJson = JSON.parse(response);
    const result = responseJson.data;

    if(!Array.isArray(result)) {
        console.error("Got invalid server response (expected an array of ids)");
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
