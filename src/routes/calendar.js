const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

const allEventsForReferenceId = require('../queries/allEventsForReferenceId');
const queryToIcs = require('../parsers/queryToIcs');
const Readable = require('stream').Readable;

const getRequest = require('../http_requests/getRequest');
const config = require('../http_requests/config');

router.get('/test', function (req, res) {
  // TODO: get token from authentication header
  const token = 'student1_1';
  Promise.resolve(getRequest(config.SCHULCLOUD_ALL_SCOPES_FOR_TOKEN + token))
      .then(function(result) {
        var icsFile = new Readable();
        var contentLength = 0;
        const referenceIds = JSON.parse(result).data.map(function(entry) {
            return entry.id;
        });
        referenceIds.forEach(function(referenceId, index) {
            Promise.resolve(allEventsForReferenceId(referenceId))
                .then(function(result) {
                  console.log(index);

                    const ics = queryToIcs(result);
                    console.log(ics);
                    icsFile.push(ics);
                    contentLength += ics.length;

                    if (index === referenceIds.length - 1) {
                        sendResponse();
                    }
                })
                .catch(function(error) {
                    console.error("Query error");
                })
        });

        function sendResponse() {
            icsFile.push(null);
            res.writeHead(200, {
                'Content-Disposition': 'attachment; filename=calendar.ics',
                'Content-Type': 'text/calendar',  //application/octet-stream (?)
                'Content-Length': contentLength
            });
            icsFile.pipe(res);
        }
      })
      .catch(function(status) {
          console.error("Error during API request, status " + status);
          if (!res.headersSent)
              res.status(500).send("Internal Server Error");
      });
});

module.exports = router;
