const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

const icsToJson = require('../parsers/icsToJson');
const insertEventsWithReferenceIds = require('../queries/insertEventsWithReferenceIds');
const deleteEvent = require('../queries/deleteEvent');
const getRequest = require('../http_requests/getRequest');
const config = require('../http_requests/config');

router.post('/', function (req, res) {
    const ids = req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
        console.error("Got invalid \'ids\' array!");
        res.status(500).send("Internal Server Error");
        return;
    }
    const seperate = req.body.seperate;
    const ics = req.body.ics;
    const json = icsToJson(ics);
    if (!json) {
        res.status(500).send("Internal Server Error");
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
        Promise.resolve(getRequest(config.SCHULCLOUD_ALL_USERS_FOR_UUID + ids[0]))
            .then(function(data) {
                const result = data.result.data;
                referenceIds = [];
                if (Array.isArray(result)) {
                    for (var i in result) {
                        referenceIds.push(result[i]['id'])
                    }
                }
                Promise.resolve(insertEventsWithReferenceIds(params, referenceIds))
                    .then(function() {
                        if (!res.headersSent)
                            res.status(201).send("Success");
                    })
                    .catch(function(error) {
                        console.error("Error during creating Events in DB!");
                        console.error(error);
                        if (!res.headersSent)
                            res.status(500).send("Internal Server Error");
                    });
            })
            .catch(function(status) {
                console.error("Error during API request, status " + status);
                if (!res.headersSent)
                    res.status(500).send("Internal Server Error");
            });
    } else {
        referenceIds = [ids[0]];
        Promise.resolve(insertEventsWithReferenceIds(params, referenceIds))
            .then(function() {
                if (!res.headersSent)
                    res.status(201).send("Success");
            })
            .catch(function(error) {
                console.error("Error during creating Events in DB!");
                console.error(error)
                if (!res.headersSent)
                    res.status(500).send("Internal Server Error");
            });
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
    Promise.resolve(deleteEvent([id]))
        .then(function () {
            if (!res.headersSent)
                res.status(201).send("Success");
        })
        .catch(function (error) {
            console.error("Error during deleting an Event in DB!");
            console.error(error)
            if (!res.headersSent)
                res.status(500).send("Internal Server Error");
        })
});

module.exports = router;
