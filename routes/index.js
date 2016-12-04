const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const eventTranslationService = require('../services/EventTranslationService');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded());

// TODO: move logic from router to some other location...
var client = require('../models/database')

/* GET home page. */
router.get('/', function (req, res, next) {
    const query = 'SELECT * FROM events;'
    client.query(query, function (error, result) {
        if (error) {
            res.render('index', {query: 'Error', queryResult: JSON.stringify(error)})
        } else {
            res.render('index', {query, queryResult: JSON.stringify(result)})
        }
    })
});

router.get('/calendar/test', function (req, res) {

    const query = 'SELECT * FROM events ORDER BY id ASC';
    client.query(query, function (error, result) {
        if (error) {
            console.error("Query error");
        } else {
            var ical = 'BEGIN:VCALENDAR\n';
            ical += 'VERSION:2.0\n';
            ical += 'PRODID:http://schulcloud.org/calendar/test/\n';
            for (var row_count in result.rows) {
                var start_date = new Date(result.rows[row_count].start_timestamp);
                var end_date = new Date(result.rows[row_count].end_timestamp);
                var created_date = new Date(result.rows[row_count].created_timestamp);
                var last_modified_date = new Date(result.rows[row_count].last_modified_timestamp);
                ical += 'BEGIN:VEVENT\n';
                ical += 'UID:' + result.rows[row_count].id + '@schulcloud.org\n';
                if (result.rows[row_count].location) {
                    ical += 'LOCATION:' + result.rows[row_count].location + '\n';
                }
                ical += 'SUMMARY:' + result.rows[row_count].summary + '\n';
                if (result.rows[row_count].description) {
                    ical += 'DESCRIPTION:' + result.rows[row_count].description + '\n';
                }
                ical += 'DTSTART:' + start_date.toISOString().replace(/([:-]|(\..{3}))/g, '') + '\n';
                ical += 'DTEND:' + end_date.toISOString().replace(/([:-]|(\..{3}))/g, '') + '\n';
                ical += 'DTSTAMP:' + created_date.toISOString().replace(/([:-]|(\..{3}))/g, '') + '\n';
                ical += 'LAST-MODIFIED:' + last_modified_date.toISOString().replace(/([:-]|(\..{3}))/g, '') + '\n';
                ical += 'END:VEVENT\n';
            }
            ical += 'END:VCALENDAR\n';

            var Readable = require('stream').Readable;
            var s = new Readable();
            s.push(ical);
            s.push(null);
            res.writeHead(200, {
                'Content-Disposition': 'attachment; filename=calendar.ics',
                'Content-Type': 'text/calendar',  //application/octet-stream?
                'Content-Length': ical.length
            });
            s.pipe(res);
        }
    });
});

router.get('/system_info/haproxy', function (req, res) {
    res.send({"timestamp": new Date().getTime()});
});

router.get('/ping', function (req, res) {
    res.send({"message": "pong", "timestamp": new Date().getTime()});
});

router.post('/events', function (req, res) {
    var ids = req.body.ids;
    var seperate = req.body.seperate;
    var ics = req.body.ics;

    // id, summary, location, description, start_timestamp, end_timestamp, reference_id, created_timestamp,
    //      last_modified_timestamp
    //TODO: check if SQL injection prevention works properly
    const query = 'INSERT INTO events (summary, location, description, start_timestamp, end_timestamp, reference_id, created_timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7)';
    const json = eventTranslationService.icsToJson(ics);
    var params = [];
    params[0] = json["summary"];            //$1: summary
    params[1] = json["location"];           //$2: location
    params[2] = json["description"];        //$3: description
    params[3] = json["start_timestamp"];    //$4: start_timestamp
    params[4] = json["end_timestamp"];      //$5: end_timestamp
    params[6] = new Date();                 //$7: created_timestamp

    if (seperate == true) {
        //TODO: implement request to server to get all required ids
        var seperatedIds = [];
        for (var i = 0; i < seperatedIds.length; i++) {
            params[5] = seperatedIds[i];    //$6: reference_id
            client.query(query, params, function (error, result) {
                if (error) {
                    console.error("Error during processing SQL INSERT query!");
                } else {
                    console.log("Successfully created Event entry in DB!");
                }
            });
        }
    } else {
        params[5] = ids[0];                 //$6: reference_id
        client.query(query, params, function (error, result) {
            if (error) {
                console.error("Error during processing SQL INSERT query!");
            } else {
                console.log("Successfully created Event entry in DB!");
            }
        });
    }
    res.writeHead(201);

});

router.put('/events/:id', function (req, res) {
    var ids = req.body.ids;
    var seperate = req.body.seperate;
    var ics = req.body.ics;
    var id = req.id;
});

router.delete('/events/:id', function (req, res) {
    var id = req.id;
});

module.exports = router;
