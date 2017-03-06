
const Readable = require('stream').Readable;

/**
 * returns an iCalendar String properly to the client
 * @param res
 * @param icsString
 */
function returnIcs(res, icsString) {
    const finalIcs = new Readable();
    finalIcs.push(icsString);
    finalIcs.push(null);
    res.writeHead(200, {
        'Content-Disposition': 'attachment; filename=calendar.ics',
        'Content-Type': 'text/calendar', //application/octet-stream (?)
        'Content-Length': icsString.length
    });
    finalIcs.pipe(res);
}

module.exports = returnIcs;
