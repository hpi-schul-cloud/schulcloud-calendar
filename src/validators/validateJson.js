const moment = require('moment');

const repeat_freq_regex = new RegExp(['SECONDLY', 'MINUTELY', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].join('|'));
const weekday_regex = new RegExp(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SO'].join('|'));
const alarm_action_regex = new RegExp(['DISPLAY', 'AUDIO', 'EMAIL'].join('|'));


function validateJson(json) {
    if (!Array.isArray(json))
        return false;

    json.forEach(function (event) {
        // Fields are required by our implementation
        if (!event.separateUsers)
            return false;

        if (!(event.scopeIds && Array.isArray(event.scopeIds) && event.scopeIds.length > 0))
            return false;

        // Fields are required by the iCalendar standard
        if (!event.dtstamp)
            return false;

        if (!event.id)
            return false;

        // Fields are required by the iCalendar standard if outer scope doesn't have a METHOD
        if (!event.dtstart)
            return false;

        // Optional, but only one of these are allowed by the iCalendar standard
        if (event.dtend) {
            if (event.duration)
                return false;
        } else if (event.duration) {
            if (event.dtend)
                return false;

            // To convert the event with a duration to an event with an end date
            event.dtend = moment(event.dtstart).add(moment.duration(event.duration)).toDate();
            delete event.duration;
        }

        // Optional, but if exdate is set, a RRule is required
        if (event.exdate) {
            if (!(Array.isArray(event.exdate) && event.exdate.length > 0))
                return false;

            if (!event.repeat_freq)
                return false;
        }

        // Optional, but check for consistency
        if (event.repeat_freq) {
            if (!(repeat_freq_regex.test(event.repeat_freq)))
                return false;

            // Optional, but only one of these
            if (event.repeat_until && event.repeat_count)
                return false;

            // Constrains as defined in the iCalendar standard
            if (event.repeat_byweekno && event.repeat_freq != 'YEARLY')
                return false;

            if (event.repeat_byyearday && (
                event.repeat_freq === 'DAILY' ||
                event.repeat_freq === 'WEEKLY' ||
                event.repeat_freq === 'MONTHLY'))
                return false;

            if (event.repeat_bymonthday && event.repeat_freq === 'WEEKLY')
                return false;

            // Check for types
            if (event.repeat_bysecond && !Array.isArray(event.repeat_bysecond))
                return false;

            if (event.repeat_byminute && !Array.isArray(event.repeat_byminute))
                return false;

            if (event.repeat_byhour && !Array.isArray(event.repeat_byhour))
                return false;

            if (event.repeat_byday && !Array.isArray(event.repeat_byday))
                return false;

            if (event.repeat_bymonthday && !Array.isArray(event.repeat_bymonthday))
                return false;

            if (event.repeat_byyearday && !Array.isArray(event.repeat_byyearday))
                return false;

            if (event.repeat_byweekno && !Array.isArray(event.repeat_byweekno))
                return false;

            if (event.repeat_bymonth && !Array.isArray(event.repeat_bymonth))
                return false;

            if (event.repeat_bysetpos && !Array.isArray(event.repeat_bysetpos))
                return false;

            if (event.repeat_wkst && !(weekday_regex.test(event.repeat_wkst)))
                return false;
        }

        // if one of the optional RRule definitions is used, repeat_freq must be defined
        if (!event.repeat_freq && (
            event.repeat_count ||
            event.repeat_until ||
            event.repeat_interval ||
            event.repeat_bysecond ||
            event.repeat_byminute ||
            event.repeat_byhour ||
            event.repeat_byday ||
            event.repeat_bymonthday ||
            event.repeat_byyearday ||
            event.repeat_byweekno ||
            event.repeat_bymonth ||
            event.repeat_wkst))
            return false;

        // Optional
        if (event.alarms) {
            if (!Array.isArray(event.alarms))
                return false;

            event.alarms.forEach(function (alarm) {
                if (!(alarm.action && alarm_action_regex.test(alarm.action)))
                    return false;

                if (!alarm.trigger)
                    return false;

                // Optional, but if one is present, the other one must be present as well (check in DNF using XOR)
                if ((alarm.duration && !alarm.repeat) || (!alarm.duration && alarm.repeat))
                    return false;

                // Checks per action
                if (alarm.action === 'AUDIO') {
                    if (alarm.description)
                        return false;
                }

                if (alarm.action === 'DISPLAY') {
                    if (!alarm.description)
                        return false;

                    if (alarm.attach)
                        return false;
                }

                if (alarm.action === 'EMAIL') {
                    if (!alarm.description)
                        return false;

                    if (!alarm.summary)
                        return false;

                    if (!(alarm.attendee && Array.isArray(alarm.attendee) && alarm.attendee.length > 0))
                        return false;
                }
            })
        }
    });

    // All checks passed, JSON is valid
    console.log('All checks passed, JSON is valid');
    return true;
}

module.exports = validateJson;
