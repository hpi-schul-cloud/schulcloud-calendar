const validateIcs = require('./validateIcs');
const validateJson = require('./validateJson');

function icsToJson(ics) {
    const lines = ics.split("\n");

    if (!validateIcs(lines)) {
        console.error('[icsToJson] Invalid ICS file');
        return;
    }

    let events = [];
    let event = {};

    let alarm = {};
    let parseAlarm = false;

    // TODO: Unfold lines first (see RFC 5545, section 3.1)
    lines.forEach(function(line) {
        switch (line) {
            case 'BEGIN:VCALENDAR':
                break;
            case 'END:VCALENDAR':
                break;
            case 'BEGIN:VEVENT':
                event = {};
                break;
            case 'END:VEVENT':
                if (validateJson(event) && !parseAlarm) {
                    events.push(event);
                } else {
                    console.error('[icsToJson] Created invalid JSON, are all required fields present?')
                }
                break;
            case 'BEGIN:VALARM':
                alarm = {};
                parseAlarm = true;
                break;
            case 'END:VALARM':
                parseAlarm = false;
                if (event["alarms"] === undefined) {
                    event["alarms"] = [];
                }
                event["alarms"].push(alarm);
                break;
            default:
                if (parseAlarm) {
                    lineToAlarmJson(line, alarm);
                } else {
                    lineToJson(line, event);
                }
                break;
        }
    });

    return events;
}

function lineToJson(line, event) {
    const splitPosition = line.indexOf(':');

    if (splitPosition === -1) {
        console.error('[icsToJson] Invalid line in ICS');
        return;
    }

    const fieldName = line.substr(0, splitPosition);
    const fieldValue = line.substr(splitPosition + 1, line.length);

    switch (fieldName) {
        case "UID":
            const splittedUid = fieldValue.split('@');
            if (splittedUid.length === 2) {
                event['id'] = splittedUid[0];
            } else {
                // TODO: an UID is not required to contain an @.
                console.error("[icsToJson] Invalid UID")
            }
            break;
        case "LOCATION":
            event["location"] = fieldValue;
            break;
        case "SUMMARY":
            event["summary"] = fieldValue;
            break;
        case "DESCRIPTION":
            const field = fieldName.toLowerCase();
            event[field] = fieldValue;
            break;
        case "DTSTART":
            event["start_timestamp"] = regularDateFormat(fieldValue);
            break;
        case "DTEND":
            event["end_timestamp"] = regularDateFormat(fieldValue);
            break;
        case "DTSTAMP":
            event["created_timestamo"] = regularDateFormat(fieldValue);
            break;
        case "LAST-MODIFIED":
            event["modified_timestamp"] = regularDateFormat(fieldValue);
            break;
        default:
            console.error('[icsToJson] Got unknown ICS field. Implement ' + fieldName);
            break;
    }
}

function lineToAlarmJson(line, alarm) {
    const splitPositionColon = line.indexOf(':');
    const splitPositionSemiColon = line.indexOf(';');

    let splitPosition = -1;
    let includeSplitPosition = 1;
    if (splitPositionColon !== -1 && splitPositionSemiColon !== -1) {
        if (splitPositionColon <= splitPositionSemiColon) {
            splitPosition = splitPositionColon;
            includeSplitPosition = 1;
        } else if (splitPositionSemiColon < splitPositionColon) {
            splitPosition = splitPositionSemiColon;
            includeSplitPosition = 0;
        }
    } else if (splitPositionColon === -1 && splitPositionSemiColon !== -1) {
        splitPosition = splitPositionSemiColon;
        includeSplitPosition = 0;
    } else if (splitPositionSemiColon === -1 && splitPositionSemiColon) {
        splitPosition = splitPositionColon;
        includeSplitPosition = 1;
    }

    if (splitPosition === -1) {
        console.error('[icsToJson] Invalid line in ICS (parsing alarm): ' + line);
        return;
    }

    const fieldName = line.substr(0, splitPosition);
    const fieldValue = line.substr(splitPosition + includeSplitPosition, line.length);

    switch (fieldName) {
        case "TRIGGER":
            alarm["trigger"] = fieldValue;
            break;
        case "REPEAT":
            alarm["repeat"] = parseInt(fieldValue);
            break;
        case "DURATION":
            alarm["duration"] = fieldValue;
            break;
        case "ACTION":
            alarm["action"] = fieldValue;
            break;
        case "ATTACH":
            alarm["attach"] = fieldValue;
            break;
        case "DESCRIPTION":
            alarm["description"] = fieldValue;
            break;
        case "ATTENDEE":
            alarm["attendee"] = fieldValue;
            break;
        case "SUMMARY":
            alarm["summary"] = fieldValue;
            break;
        default:
            console.error('[icsToJson] Got unknown ICS field for alarm. Implement ' + fieldName);
            break;
    }
}

function regularDateFormat(date) {

    // YYYYMMDD'T'hhmmss'Z'

    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const day = date.slice(6, 8);

    const hour = date.slice(9, 11);
    const minute = date.slice(11, 13);
    const second = date.slice(13, 15);

    return new Date(year, month-1, day, hour, minute, second);
}

module.exports = icsToJson;
