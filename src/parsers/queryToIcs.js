const allAlarmsForEvent = require('../queries/allAlarmsForEvent');
const iCalendarDateFormat = require('../parsers/iCalendarDateFormat');

/**
 * @deprecated use queryToEventIcs and eventsToFinalIcs instead
 */
function queryToIcs(queryResult, scope, exdates, alarms) {
    var ics = 'BEGIN:VCALENDAR\n';
    ics += 'VERSION:2.0\n';
    ics += 'PRODID:https://schulcloud.org:3000/calendar/test/\n';

    const name = scope && scope.attributes.name;
    if (name) {
        ics += 'X-WR-CALNAME:' + name + '\n'
    }

    const events = queryResult.rows;
    if (events.length === 0) {
        // TODO: Handle empty calendar
        return '';
    }

    events.map(function (event) {
        const startDate = new Date(event.start_timestamp);
        const endDate = new Date(event.end_timestamp);
        const createdAt = new Date(event.created_timestamp);
        var lastModified = new Date(event.last_modified_timestamp);
        ics += 'BEGIN:VEVENT\n';
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
    });

    return ics += 'END:VCALENDAR\n';
}

module.exports = queryToIcs;
