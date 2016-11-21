var express = require('express')
var router = express.Router()

// TODO: move logic from router to some other location...
var client = require('../models/database')

/* GET home page. */
router.get('/', function(req, res, next) {
  const query = 'SELECT * FROM events;'
  client.query(query, function(error, result) {
    if (error) {
      res.render('index', { query: 'Error', queryResult: JSON.stringify(error) })
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

module.exports = router
