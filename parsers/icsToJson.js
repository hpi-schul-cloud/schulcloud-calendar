const validateIcs = require('./validateIcs');
const validateJson = require('./validateJson');

// TODO use or delete this
const acceptedICalVersions = [
    "2.0"
];

function icsToJson(ics) {
    var lines = ics.split("\n");

    if (!validateIcs(lines)) {
        console.error('[eventTranslationService] icsToJson: Invalid ICS file');
    }

    var events = [];
    var event = {};
    lines.forEach(function(line) {
        switch (line) {
            case 'BEGIN:VCALENDAR':
            case 'END:VEVENT':
                break;
            case 'BEGIN:VEVENT':
                event = {};
                break;
            case 'END:VEVENT':
                if (validateJson(event)) {
                    events.add(event);
                    break;
                } else {
                    console.error('[eventTranslationService] icsToJson: Created invalid JSON, are all required fields present?')
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
        console.error('[eventTranslationService] icsToJson: Invalid line in ICS');
    }

    const fieldName = line.substr(0, splitPosition);
    const fieldValue = line.substr(splitPosition + 1, line.length);

    switch (fieldName) {
        case "UID":
            const splittedUid = fieldValue.split('@');
            if (splittedUid.length === 2) {
                event['id'] = splittedUid[0];
            } else {
                console.error("[eventTranslationService] icsToJson: Invalid UID")
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
            console.error('[eventTranslationService] icsToJson: Got unknown ICS field. Implement ' + fieldName);
            break;
    }
}

module.exports = icsToJson;
