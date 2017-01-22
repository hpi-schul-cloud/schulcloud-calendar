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
            ics += 'RRULE:FREQ=' + event.repeat + ';';
            if (event.repeat_until)
                ics += 'UNTIL=' + iCalendarDateFormat(event.repeat_until) + ';';
            if (event.repeat_count)
                ics += 'COUNT=' + event.repeat_count + ';';
            if (event.repeat_interval)
                ics += 'INTERVAL=' + event.repeat_interval + ';';
            if (event.repeat_bysecond)
                ics += 'BYSECOND=' + event.repeat_bysecond + ';';
            if (event.repeat_byminute)
                ics += 'BYMINUTE=' + event.repeat_byminute + ';';
            if (event.repeat_byhour)
                ics += 'BYHOUR=' + event.repeat_byhour + ';';
            if (event.repeat_byday)
                ics += 'BYDAY=' + event.repeat_byday + ';';
            if (event.repeat_bymonthday)
                ics += 'BYMONTHDAY=' + event.repeat_bymonthday + ';';
            if (event.repeat_byyearday)
                ics += 'BYYEARDAY=' + event.repeat_byyearday + ';';
            if (event.repeat_byweekno)
                ics += 'BYWEEKNO=' + event.repeat_byweekno + ';';
            if (event.repeat_bymonth)
                ics += 'BYMONTH=' + event.repeat_bymonth + ';';
            if (event.repeat_bysetpos)
                ics += 'BYSETPOS=' + event.repeat_bysetpos + ';';
            if (event.repeat_wkst)
                ics += 'WKST=' + event.repeat_wkst + ';';
            ics += '\n';
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
