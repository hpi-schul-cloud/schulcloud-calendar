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
        console.error("Got invalid \'ids\' array!");
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
        for (var i in json) {
            handleJson(json[i], seperate, ids, req, res);
        }
    } else {
        handleJson(json, seperate, ids, req, res);
    }

});

function handleJson(json, seperate, ids, req, res) {
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

    if (seperate === true) {
        Promise.resolve(getAllUsersForUUID(ids[0])).then(
            function(response) {
                const responseJson = JSON.parse(response);
                const result = responseJson.data;
                referenceIds = [];
                if (Array.isArray(result)) {
                    for (var i in result) {
                        referenceIds.push(result[i]['id'])
                    }
                    Promise.resolve(insertEventsWithReferenceIds(params, referenceIds)).then(
                        handleSuccess.bind(null, res),
                        handleError.bind(null, res)
                    );
                } else {
                    console.error("Got invalid server response (expected an array of ids)");
                }

            }, handleError.bind(null, res));
    } else {
        referenceIds = [ids[0]];
        Promise.resolve(insertEventsWithReferenceIds(params, referenceIds)).then(
            handleSuccess.bind(null, res),
            handleError.bind(null, res)
        );
    }
}

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

module.exports = router;
