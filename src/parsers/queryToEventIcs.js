const allAlarmsForEvent = require('../queries/allAlarmsForEvent');
const iCalendarDateFormat = require('../parsers/iCalendarDateFormat');

function queryToEventIcs(event, exdates, alarms) {
    const startDate = new Date(event.start_timestamp);
    const endDate = new Date(event.end_timestamp);
    const createdAt = new Date(event.created_timestamp);
    const lastModified = new Date(event.last_modified_timestamp);
    let ics = 'BEGIN:VEVENT\n';
    ics += 'UID:' + event.id + '@schulcloud.org\n';
    if (event.location) {
        ics += 'LOCATION:' + event.location + '\n';
    }
    ics += 'SUMMARY:' + event.summary + '\n';
    if (event.description) {
        ics += 'DESCRIPTION:' + event.description + '\n';
    }
    if (event.repeat) {
        if (event.repeat_byday)
            ics += 'RRULE:FREQ=' + event.repeat + ';INTERVAL=' + event.repeat_interval + ';BYDAY=' + event.repeat_byday + '\n';
        else
            ics += 'RRULE:FREQ=' + event.repeat + ';INTERVAL=' + event.repeat_interval + '\n';
    }
    if (exdates && exdates[event.id])
        ics += exdates[event.id];
    ics += 'DTSTART:' + iCalendarDateFormat(startDate) + '\n';
    ics += 'DTEND:' + iCalendarDateFormat(endDate) + '\n';
    ics += 'DTSTAMP:' + iCalendarDateFormat(createdAt) + '\n';
    ics += 'LAST-MODIFIED:' + iCalendarDateFormat(lastModified) + '\n';

    if (alarms && alarms[event.id])
        ics += alarms[event.id];

    ics += 'END:VEVENT\n';

    return ics;
}

module.exports = queryToEventIcs;
