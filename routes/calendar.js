const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

const eventTranslationService = require('../services/eventTranslationService');
const eventQueries = require('../queries/eventQueries');
const Readable = require('stream').Readable;

router.get('/test', function (req, res) {
    Promise.resolve(eventQueries.getAll())
        .then(function(result) {
            const ics = eventTranslationService.queryToIcs(result);
            var icsFile = new Readable();
            icsFile.push(ics);
            icsFile.push(null);
            res.writeHead(200, {
                'Content-Disposition': 'attachment; filename=calendar.ics',
                'Content-Type': 'text/calendar',  //application/octet-stream (?)
                'Content-Length': ics.length
            });
            icsFile.pipe(res);
        })
        .catch(function(error) {
            console.log("Query error");
        })
});

module.exports = router;
