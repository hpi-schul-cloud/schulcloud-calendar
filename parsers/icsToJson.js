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
        console.log(line);
        switch (line) {
            case 'BEGIN:VCALENDAR':
            case 'END:VCALENDAR':
                break;
            case 'BEGIN:VEVENT':
                event = {};
                break;
            case 'END:VEVENT':
                if (validateJson(event)) {
                    events.push(event);
                    break;
                } else {
                    console.error('[icsToJson] Created invalid JSON, are all required fields present?')
                    break;
                }
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
        case "SUMMARY":
        case "DESCRIPTION":
            const field = fieldName.toLowerCase();
            event[field] = fieldValue;
            break;
        case "DTSTART":
        case "DTEND":
        case "DTSTAMP":
        case "LAST-MODIFIED":
            break;
        default:
            console.error('[icsToJson] Got unknown ICS field. Implement ' + fieldName);
            break;
    }
}

module.exports = icsToJson;
