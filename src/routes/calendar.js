const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

const allEvents = require('../queries/allEvents');
const queryToIcs = require('../parsers/queryToIcs');
const Readable = require('stream').Readable;

router.get('/test', function (req, res) {
    Promise.resolve(allEvents())
        .then(function(result) {
            const ics = queryToIcs(result);
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
            console.error("Query error");
        })
});

module.exports = router;
