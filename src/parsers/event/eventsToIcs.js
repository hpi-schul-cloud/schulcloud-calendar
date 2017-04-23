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
        let rrule = 'RRULE:FREQ=' + event.repeat_freq;

        if (event.repeat_until)
            rrule += ';UNTIL=' + iCalendarDateFormat(event.repeat_until);

        if (event.repeat_count)
            rrule += ';COUNT=' + event.repeat_count;

        if (event.repeat_interval)
            rrule += ';INTERVAL=' + event.repeat_interval;

        if (event.repeat_bysecond)
            rrule += ';BYSECOND=' + event.repeat_bysecond.join(',');

        if (event.repeat_byminute)
            rrule += ';BYMINUTE=' + event.repeat_byminute.join(',');

        if (event.repeat_byhour)
            rrule += ';BYHOUR=' + event.repeat_byhour.join(',');

        if (event.repeat_byday)
            rrule += ';BYDAY=' + event.repeat_byday.join(',');

        if (event.repeat_bymonthday)
            rrule += ';BYMONTHDAY=' + event.repeat_bymonthday.join(',');

        if (event.repeat_byyearday)
            rrule += ';BYYEARDAY=' + event.repeat_byyearday.join(',');

        if (event.repeat_byweekno)
            rrule += ';BYWEEKNO=' + event.repeat_byweekno.join(',');

        if (event.repeat_bysetpos)
            rrule += ';BYSETPOS=' + event.repeat_bysetpos.join(',');

        if (event.repeat_wkst)
            rrule += ';WKST=' + event.repeat_wkst;

        ics += rrule + '\n';
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
