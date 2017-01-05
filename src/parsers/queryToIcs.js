function queryToIcs(queryResult, scope) {
    var ics = 'BEGIN:VCALENDAR\n';
    ics += 'VERSION:2.0\n';
    ics += 'PRODID:http://schulcloud.org/calendar/test/\n';

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
            ics += 'RRULE:FREQ=' + event.repeat + ';INTERVAL=' + event.repeat_interval + '\n';
        }
        ics += 'DTSTART:' + iCalendarDateFormat(startDate);
        ics += 'DTEND:' + iCalendarDateFormat(endDate);
        ics += 'DTSTAMP:' + iCalendarDateFormat(createdAt);
        ics += 'LAST-MODIFIED:' + iCalendarDateFormat(lastModified);

        // TODO: Move code for alarms? (or at least SQL query)
        ics += getAlarmsForEvent(event.id);

        ics += 'END:VEVENT\n';
    });

    return ics += 'END:VCALENDAR\n';
}

function iCalendarDateFormat(date) {
    return date.toISOString().replace(/([:-]|(\..{3}))/g, '') + '\n';
}

function getAlarmsForEvent(event_id) {
    const client = require('../models/database');

    const query = 'SELECT trigger, repeat, duration, action, attach, description, attendee, summary FROM alarms WHERE event_id = $1 ORDER BY id ASC;';

    client.query(query, [event_id], function (error, queryResult) {
        if (error) {
            console.error("Query error");
            return '';
        } else {
            const alarms = queryResult.rows;
            if (alarms.length === 0) {
                return '';
            }

            var ics = '';

            alarms.map(function (alarm) {
                ics += 'BEGIN:VALARM\n';

                ics += 'TRIGGER';
                if (!alarm.trigger.startsWith(';')) {
                    ics += ':';
                }
                ics += alarm.trigger + '\n';

                if (alarm.repeat && alarm.duration) {
                    ics += 'REPEAT:' + alarm.repeat + '\n';
                    ics += 'DURATION:' + alarm.duration + '\n';
                }

                ics += 'ACTION:' + alarm.action + '\n';

                if (alarm.attach) {
                    ics += 'ATTACH:' + alarm.attach + '\n';
                }

                if (alarm.description) {
                    ics += 'DESCRIPTION:' + alarm.description + '\n';
                }

                if (alarm.attendee) {
                    ics += 'ATTENDEE:' + alarm.attendee + '\n';
                }

                if (alarm.summary) {
                    ics += 'SUMMARY:' + alarm.summary + '\n';
                }

                ics += 'END:VALARM\n';
            });
            console.log(ics);
            return ics;
        }
    });
}

module.exports = queryToIcs;
