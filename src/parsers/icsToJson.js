const validateIcs = require('./validate/validateIcs');
const validateJson = require('./validate/validateJson');
const consoleError = require('../utils/consoleError');
const regularDateFormat = require('../parsers/regularDateFormat');

function icsToJson(ics) {
    const lines = ics.split("\n");

    if (!validateIcs(lines)) {
        consoleError('[icsToJson] Invalid ICS file');
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
                    consoleError('[icsToJson] Created invalid JSON, are all required fields present?')
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
        consoleError('[icsToJson] Invalid line in ICS');
        return;
    }

    const fieldName = line.substr(0, splitPosition);
    const fieldValue = line.substr(splitPosition + 1, line.length);

    switch (fieldName) {
        case "UID":
            const splittedUid = fieldValue.split('@');
            if (splittedUid.length === 2) {
                event['id'] = splittedUid[0];
            } else if (splittedUid.length ===1) {
                event['id'] = fieldValue
            } else {
                consoleError("[icsToJson] Invalid UID")
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
            event["dtstart"] = regularDateFormat(fieldValue);
            break;
        case "DTEND":
            event["dtend"] = regularDateFormat(fieldValue);
            break;
        case "DTSTAMP":
            event["dtstamp"] = regularDateFormat(fieldValue);
            break;
        case "LAST-MODIFIED":
            event["last-modified"] = regularDateFormat(fieldValue);
            break;
        case "RRULE":
            const repeatAttributes = fieldValue.split(';');
            for (var i = 0; i < repeatAttributes.length; i++) {
                const raName = (repeatAttributes[i].split('='))[0];
                const raValue = (repeatAttributes[i].split('='))[1];
                switch (raName) {
                    case "FREQ":
                        event["repeat_freq"] = raValue;
                        break;
                    case "UNTIL":
                        event["repeat_until"] = regularDateFormat(raValue);
                        break;
                    case "COUNT":
                        event["repeat_count"] = raValue;
                        break;
                    case "INTERVAL":
                        event["repeat_interval"] = raValue;
                        break;
                    case "BYSECOND":
                        event["repeat_bysecond"] = raValue;
                        break;
                    case "BYMINUTE":
                        event["repeat_byminute"] = raValue;
                        break;
                    case "BYHOUR":
                        event["repeat_byhour"] = raValue;
                        break;
                    case "BYDAY":
                        event["repeat_byday"] = raValue;
                        break;
                    case "BYMONTHDAY":
                        event["repeat_bymonthday"] = raValue;
                        break;
                    case "BYYEARDAY":
                        event["repeat_byyearday"] = raValue;
                        break;
                    case "BYWEEKNO":
                        event["repeat_byweekno"] = raValue;
                        break;
                    case "BYMONTH":
                        event["repeat_bymonth"] = raValue;
                        break;
                    case "BYSETPOS":
                        event["repeat_bysetpos"] = raValue;
                        break;
                    case "WKST":
                        event["repeat_wkst"] = raValue;
                        break;
                    default:
                        console.error("[icsToJson] Invalid repeat attribute: " + raName + ": " + raValue);
                }
            }
            break;
        case "EXDATE":
            if (!Array.isArray(event["exdate"]))
                event["exdate"] = [];
            event["exdate"].push(regularDateFormat(fieldValue));
            break;
        default:
            // temporary for timezone support...
            const splitPosition2 = fieldName.indexOf(';');
            if (splitPosition2 === -1) {
                return;
            }
            const realFieldName = fieldName.substr(0, splitPosition2);
            const timezone = fieldName.substr(splitPosition2 + 1, fieldName.length);

            // TODO: handle timezone

            switch (realFieldName) {
                case "DTSTART":
                    event["dtstart"] = regularDateFormat(fieldValue);
                    break;
                case "DTEND":
                    event["dtend"] = regularDateFormat(fieldValue);
                    break;
                case "DTSTAMP":
                    event["dtstamp"] = regularDateFormat(fieldValue);
                    break;
                case "LAST-MODIFIED":
                    event["last-modified"] = regularDateFormat(fieldValue);
                    break;
                case "EXDATE":
                    if (!Array.isArray(event["exdate"])) {
                        event["exdate"] = [];
                    }
                    event["exdate"].push(regularDateFormat(fieldValue));
                    break;
                default:
                    consoleError('[icsToJson] Got unknown ICS field. Implement ' + fieldName);
                    break;
            }
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

module.exports = icsToJson;
