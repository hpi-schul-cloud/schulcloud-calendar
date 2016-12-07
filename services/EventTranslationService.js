/**
 * @author Niklas Hoffmann
 */

// TODO TEST!!

const validateIcs = require('./translation-utils/validateIcs');
const validateJson = require('./translation-utils/validateJson');

const acceptecICalVersions = [
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
}

function jsonToIcs(json) {
    // TODO implement
    var ics = "";
    return ics;
}

function queryToIcs(queryResult) {
    var ics = 'BEGIN:VCALENDAR\n';
    ics += 'VERSION:2.0\n';
    ics += 'PRODID:http://schulcloud.org/calendar/test/\n';
    const events = queryResult.rows;
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
        ics += 'DTSTART:' + iCalendarDateFormat(startDate);
        ics += 'DTEND:' + iCalendarDateFormat(endDate);
        ics += 'DTSTAMP:' + iCalendarDateFormat(createdAt);
        ics += 'LAST-MODIFIED:' + iCalendarDateFormat(lastModified);
        ics += 'END:VEVENT\n';
    });
    return ics += 'END:VCALENDAR\n';

    function iCalendarDateFormat(date) {
        return date.toISOString().replace(/([:-]|(\..{3}))/g, '') + '\n';
    }
}

module.exports = {
    icsToJson: icsToJson,
    jsonToIcs: jsonToIcs,
    queryToIcs: queryToIcs
};
