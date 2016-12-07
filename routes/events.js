const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

const eventTranslationService = require('../services/eventTranslationService');
const eventQueries = require('../queries/eventQueries');

// TODO TEST REFACTORING!!

router.post('/', function (req, res) {
    const ids = req.body.ids;
    const seperate = req.body.seperate;
    const ics = req.body.ics;
    const json = eventTranslationService.icsToJson(ics);
    var params = [];
    var referenceIds;

    /*
     * json contains id, summary, location, description, start_timestamp,
     * end_timestamp, reference_id, created_timestamp, last_modified_timestamp
     */
    params[0] = json["summary"];            //$1: summary
    params[1] = json["location"];           //$2: location
    params[2] = json["description"];        //$3: description
    params[3] = json["start_timestamp"];    //$4: start_timestamp
    params[4] = json["end_timestamp"];      //$5: end_timestamp
    params[6] = new Date();                 //$7: created_timestamp

    if (seperate === true) {
        //TODO: implement request to server to get all required ids
        referenceIds = [];
    } else {
        referenceIds = [ids[0]];
    }

    referenceIds.forEach(function(referenceId) {
        params[5] = referenceId;            //$6: reference_id
        Promise.resolve(eventQueries.insert(params))
            .then(console.log('Successfully created Event entry in DB!'))
            .catch(console.error('Error during processing SQL INSERT query!'))
    });

    res.writeHead(201);

});

router.put('/:id', function (req, res) {
    // TODO implement
    var ids = req.body.ids;
    var seperate = req.body.seperate;
    var ics = req.body.ics;
    var id = req.id;
});

router.delete('/:id', function (req, res) {
    // TODO implement
    var id = req.id;
});

module.exports = router;
