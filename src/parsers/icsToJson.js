const validateIcs = require('./validateIcs');
const validateJson = require('./validateJson');

function icsToJson(ics) {
    const lines = ics.split("\n");

    if (!validateIcs(lines)) {
        console.error('[icsToJson] Invalid ICS file');
        return;
    }

    var events = [];
    var event = {};
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
                if (validateJson(event)) {
                    events.push(event);
                } else {
                    console.error('[icsToJson] Created invalid JSON, are all required fields present?')
                }
                break;
            default:
                lineToJson(line, event);
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
        case "RRULE":
            const repeatAttributes = fieldValue.split(';');
            console.log(repeatAttributes);
            for (var i = 0; i < repeatAttributes.length; i++) {
                const raName = (repeatAttributes[i].split('='))[0];
                console.log(raName);
                const raValue = (repeatAttributes[i].split('='))[1];
                console.log(raValue);
                switch (raName) {
                    case "FREQ":
                        event["repeat"] = raValue;
                        break;
                    case "INTERVAL":
                        event["repeat_interval"] = raValue;
                        break;
                    default:
                        console.error("Invalid repeat attribute: " + raName + ": " + raValue);
                }
            }
            break;
        default:
            console.error('[icsToJson] Got unknown ICS field. Implement ' + fieldName);
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
