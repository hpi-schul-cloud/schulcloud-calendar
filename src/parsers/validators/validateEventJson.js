const moment = require('moment');

const repeat_freq_regex = new RegExp(['SECONDLY', 'MINUTELY', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].join('|'));
const weekday_regex = new RegExp(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SO'].join('|'));
const alarm_action_regex = new RegExp(['DISPLAY', 'AUDIO', 'EMAIL'].join('|'));


function validateJson(json, scopeIDsRequired = true, onlyOneEvent = false) {
    let errorMessage = null;

    if (!Array.isArray(json)) {
        errorMessage = "The value of 'data' must be an array.";
        return false;
    }

    let event_uids = new Set();

    json.every((event) => {
        // Fields are required by our implementation
        if (scopeIDsRequired && event.separateUsers === undefined) {
            errorMessage = "The attribute 'relationships'.'separate-users' is required for every event.";
            return false;
        }

        if (scopeIDsRequired && !(event.scopeIds && Array.isArray(event.scopeIds) && event.scopeIds.length > 0)) {
            errorMessage = "The attribute 'relationships'.'scope-ids' must be an array with one or more scope IDs.";
            return false;
        }

        // Fields are required by the iCalendar standard
        if (!event.dtstamp) {
            errorMessage = "The attribute 'dtstamp' is required.";
            return false;
        }

        if (!event.id) {
            errorMessage = "The attribute 'uid' is required.";
            return false;
        }
        event_uids.add(event.id);

        // Fields are required by the iCalendar standard if outer scope doesn't have a METHOD
        if (!event.dtstart) {
            errorMessage = "The attribute 'dtstart' is required.";
            return false;
        }

        // Optional, but only one of these are allowed by the iCalendar standard
        if (event.dtend) {
            if (event.duration) {
                errorMessage = "The attribute 'dtend' cannot be combined with 'duration'.";
                return false;
            }
        } else if (event.duration) {
            if (event.dtend) {
                errorMessage = "The attribute 'dtend' cannot be combined with 'duration'.";
                return false;
            }

            // To convert the event with a duration to an event with an end date
            event.dtend = moment(event.dtstart).add(moment.duration(event.duration)).toDate();
            delete event.duration;
        }

        // Optional, but if exdates is set, a RRule is required
        if (event.exdates) {
            if (!(Array.isArray(event.exdates) && event.exdates.length > 0)) {
                errorMessage = "The attribute 'exdates' must be an array with one or more entries.";
                return false;
            }

            if (!event.repeat_freq) {
                errorMessage = "The attribute 'exdates' requires an 'rrule' with a given 'freq'.";
                return false;
            }
        }

        // Optional, but check for consistency
        if (event.repeat_freq) {
            if (!(repeat_freq_regex.test(event.repeat_freq))) {
                errorMessage = "The attribute 'freq' in the given 'rrule' is not a valid enum value.";
                return false;
            }

            // Optional, but only one of these
            if (event.repeat_until && event.repeat_count) {
                errorMessage = "The attributes 'until' and 'count' in a 'rrule' are mutually exclusive.";
                return false;
            }

            // Constrains as defined in the iCalendar standard
            if (event.repeat_byweekno && event.repeat_freq != 'YEARLY') {
                errorMessage = "The attribute 'byweekno' and the given yearly frequency in the 'rrule' cannot be combined.";
                return false;
            }

            if (event.repeat_byyearday && (
                event.repeat_freq === 'DAILY' ||
                event.repeat_freq === 'WEEKLY' ||
                event.repeat_freq === 'MONTHLY')) {
                errorMessage = "The attribute 'byyearday' and the given frequency in the 'rrule' cannot be combined.";
                return false;
            }

            if (event.repeat_bymonthday && event.repeat_freq === 'WEEKLY') {
                errorMessage = "The attribute 'bymonthday' and the given weekly frequency in the 'rrule' cannot be combined.";
                return false;
            }

            // Check for types
            if (event.repeat_bysecond && !Array.isArray(event.repeat_bysecond)) {
                errorMessage = "The attribute 'bysecond' in the 'rrule' must be an array.";
                return false;
            }

            if (event.repeat_byminute && !Array.isArray(event.repeat_byminute)) {
                errorMessage = "The attribute 'byminute' in the 'rrule' must be an array.";
                return false;
            }

            if (event.repeat_byhour && !Array.isArray(event.repeat_byhour)) {
                errorMessage = "The attribute 'byhour' in the 'rrule' must be an array.";
                return false;
            }

            if (event.repeat_byday && !Array.isArray(event.repeat_byday)) {
                errorMessage = "The attribute 'byday' in the 'rrule' must be an array.";
                return false;
            }

            if (event.repeat_bymonthday && !Array.isArray(event.repeat_bymonthday)) {
                errorMessage = "The attribute 'bymonthday' in the 'rrule' must be an array.";
                return false;
            }

            if (event.repeat_byyearday && !Array.isArray(event.repeat_byyearday)) {
                errorMessage = "The attribute 'byyearday' in the 'rrule' must be an array.";
                return false;
            }

            if (event.repeat_byweekno && !Array.isArray(event.repeat_byweekno)) {
                errorMessage = "The attribute 'byweekno' in the 'rrule' must be an array.";
                return false;
            }

            if (event.repeat_bymonth && !Array.isArray(event.repeat_bymonth)) {
                errorMessage = "The attribute 'bymonth' in the 'rrule' must be an array.";
                return false;
            }

            if (event.repeat_bysetpos && !Array.isArray(event.repeat_bysetpos)) {
                errorMessage = "The attribute 'bysetpos' in the 'rrule' must be an array.";
                return false;
            }

            if (event.repeat_wkst && !(weekday_regex.test(event.repeat_wkst))) {
                errorMessage = "The attribute 'bywkst' in the 'rrule' must be an array.";
                return false;
            }
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
            event.repeat_wkst)) {
            errorMessage = "The attribute 'freq' in the 'rrule' is missing.";
            return false;
        }

        // Optional
        if (event.alarms) {
            if (!Array.isArray(event.alarms)) {
                errorMessage = "The attribute 'alarms' must be an array.";
                return false;
            }

            event.alarms.every((alarm) => {
                if (!(alarm.action && alarm_action_regex.test(alarm.action))) {
                    errorMessage = "The 'action' in the 'alarm' is required and must match one of 'display', 'audio', 'email'.";
                    return false;
                }

                if (!alarm.trigger) {
                    errorMessage = "The 'trigger' in the 'alarm' is required.";
                    return false;
                }

                // Optional, but if one is present, the other one must be present as well (check in DNF using XOR)
                if ((alarm.duration && !alarm.repeat) || (!alarm.duration && alarm.repeat)) {
                    errorMessage = "Both attributes 'duration' and 'repeat' require each other and cannot be used alone.";
                    return false;
                }

                // Checks per action
                if (alarm.action === 'AUDIO') {
                    if (alarm.description) {
                        errorMessage = "For the given action 'audio', the attribute 'description' is not allowed.";
                        return false;
                    }
                }

                if (alarm.action === 'DISPLAY') {
                    if (!alarm.description) {
                        errorMessage = "For the given action 'display', the attribute 'description' is required.";
                        return false;
                    }

                    if (alarm.attach) {
                        errorMessage = "For the given action 'display', the attribute 'attach' is not allowed.";
                        return false;
                    }
                }

                if (alarm.action === 'EMAIL') {
                    if (!alarm.description) {
                        errorMessage = "For the given action 'email', the attribute 'description' is required.";
                        return false;
                    }

                    if (!alarm.summary) {
                        errorMessage = "For the given action 'email', the attribute 'summary' is required.";
                        return false;
                    }

                    if (!(alarm.attendee && Array.isArray(alarm.attendee) && alarm.attendee.length > 0)) {
                        errorMessage = "For the given action 'email', the attribute 'attendee' is required and must be an array with one or more entries.";
                        return false;
                    }
                }
                return true;
            });
        }
        return true;
    });

    if (onlyOneEvent && event_uids.size !== 1) {
        errorMessage = 'Only one event is allowed for this operation.';
    }

    return errorMessage || true;
}

module.exports = validateJson;
