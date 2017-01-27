const iCalendarDateFormat = require('../parsers/iCalendarDateFormat');

function queryToEventIcs(event, exdates, alarms) {
    let ics = 'BEGIN:VEVENT\n';
    ics += 'UID:' + event.event_id + '@schulcloud.org\n';
    if (event.location) {
        ics += 'LOCATION:' + event.location + '\n';
    }
    ics += 'SUMMARY:' + event.summary + '\n';
    if (event.description) {
        ics += 'DESCRIPTION:' + event.description + '\n';
    }
    if (event.repeat_freq) {
        if (event.repeat_byday)
            ics += 'RRULE:FREQ=' + event.repeat_freq + ';INTERVAL=' + event.repeat_interval + ';BYDAY=' + event.repeat_byday + '\n';
        else
            ics += 'RRULE:FREQ=' + event.repeat_freq + ';INTERVAL=' + event.repeat_interval + '\n';
    }
    if (exdates && exdates[event.id])
        ics += exdates[event.id];
    ics += 'DTSTART:' + iCalendarDateFormat(event.dtstart) + '\n';
    ics += 'DTEND:' + iCalendarDateFormat(event.dtend) + '\n';
    ics += 'DTSTAMP:' + iCalendarDateFormat(event.dtstamp) + '\n';
    ics += 'LAST-MODIFIED:' + iCalendarDateFormat(event['last-modified']) + '\n';

    if (alarms && alarms[event.id])
        ics += alarms[event.id];

    ics += 'END:VEVENT\n';

    return ics;
}

module.exports = queryToEventIcs;
