const config = require('../../config');

const iCalendarDateFormat = (date) => {
    return date.toISOString().replace(/([:-]|(\..{3}))/g, '');
};

function eventsToIcs(events, scope) {
    let ics = 'BEGIN:VCALENDAR\n';
    ics += 'VERSION:2.0\n';
    ics += `PRODID:${config.ROOT_URL}/calendar/\n`;

    if (scope && scope.name) {
        ics += `X-WR-CALNAME:${scope.name}\n`;
    }

    events.map(function (event) {
        ics += eventToIcs(event);
    });

    return ics += 'END:VCALENDAR\n';
}

function eventToIcs(event) {
    let ics = 'BEGIN:VEVENT\n';
    ics += 'UID:' + event.event_id + `@${config.DOMAIN_NAME}\n`;

    if (event.location) {
        ics += 'LOCATION:' + event.location + '\n';
    }

    ics += 'SUMMARY:' + event.summary + '\n';

    if (event.description) {
        ics += 'DESCRIPTION:' + event.description + '\n';
    }

    if (event.repeat_freq) {
        // TODO: Refactor event repetition to add support for other repeat types
        if (event.repeat_byday)
            ics += 'RRULE:FREQ=' + event.repeat_freq + ';INTERVAL=' + event.repeat_interval + ';BYDAY=' + event.repeat_byday + '\n';
        else
            ics += 'RRULE:FREQ=' + event.repeat_freq + ';INTERVAL=' + event.repeat_interval + '\n';
    }
    ics += 'DTSTART:' + iCalendarDateFormat(event.dtstart) + '\n';
    ics += 'DTEND:' + iCalendarDateFormat(event.dtend) + '\n';
    ics += 'DTSTAMP:' + iCalendarDateFormat(event.dtstamp) + '\n';

    if (event['last-modified']) {
        ics += 'LAST-MODIFIED:' + iCalendarDateFormat(event['last-modified']) + '\n';
    }

    if (event.exdates) {
        ics = formatExdates(ics, event.exdates);
    }

    if (event.alarms) {
        ics = formatAlarms(ics, event.alarms);
    }

    if (event.x_fields) {
        for (let x_field in event.x_fields) {
            if (event.x_fields.hasOwnProperty(x_field))
                ics += x_field + (event.x_fields[x_field].includes(':') ? ';' : ':') + event.x_fields[x_field] + '\n';
        }
    }

    ics += 'END:VEVENT\n';

    return ics;
}

function formatExdates(ics, exdates) {
    exdates.map(({date}) => {
        ics += 'EXDATE:' + iCalendarDateFormat(date) + '\n';
    });
    return ics;
}

function formatAlarms(ics, alarms) {
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
    return ics;
}

module.exports = eventsToIcs;
