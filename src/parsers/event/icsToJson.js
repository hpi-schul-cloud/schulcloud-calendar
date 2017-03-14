const validIcs = require('../validators/validateIcs');
const validJson = require('../validators/validateEventJson');
const regularDateFormat = require('./../utils/regularDateFormat');
const returnError = require('../../utils/response/returnError');
const logger = require('../../infrastructure/logger');

function icsToJson(req, res, next) {
    const jsonApiData = req.body.data;
    const events = [];

    jsonApiData.forEach(function (event) {
        if (event.type != 'event') {
            returnError(res, "only data of type 'event' allowed.", 400, 'Bad Request');
            return;
        }

        if (typeof event.attributes.ics === 'undefined') {
            returnError(res, 'ics attribute missing in JSON', 400, 'Bad Request');
            return;
        }

        const lines = event.attributes.ics.replace('\n ', '').replace(/^\s+|\s+$/g, '').split('\n');

        if (!validIcs(lines)) {
            returnError(res, 'Invalid ICS file', 400, 'Bad Request');
            return;
        }

        let parsedEvent = {};
        let parsedAlarm = {};
        let isParsingAlarm = false;

        lines.forEach(function (line) {
            switch (line) {
                case 'BEGIN:VCALENDAR':
                    break;
                case 'END:VCALENDAR':
                    break;
                case 'BEGIN:VEVENT':
                    parsedEvent = {};
                    parsedEvent.scope_ids = event.relationships['scope-ids'];
                    parsedEvent.separate_users = event.relationships['separate-users'];
                    break;
                case 'END:VEVENT':
                    if (!isParsingAlarm) {
                        events.push(parsedEvent);
                    } else {
                        logger.error('[icsToJson] Created invalid JSON, are all required fields present?');
                    }
                    break;
                case 'BEGIN:VALARM':
                    parsedAlarm = {};
                    isParsingAlarm = true;
                    break;
                case 'END:VALARM':
                    isParsingAlarm = false;
                    if (typeof parsedEvent['alarms'] === 'undefined') {
                        parsedEvent['alarms'] = [];
                    }
                    parsedEvent['alarms'].push(parsedAlarm);
                    break;
                default:
                    if (isParsingAlarm) {
                        lineToAlarmJson(line, parsedAlarm);
                    } else {
                        lineToJson(line, parsedEvent);
                    }
                    break;
            }
        });
    });

    let validationResult = validJson(events, true, req.method === 'PUT');
    if (validationResult === true) {
        req.events = events;
        next();
    } else {
        returnError(res, `Invalid ICS or missing JSON field: ${validationResult}`, 400, 'Bad Request');
    }
}

function lineToJson(line, event) {
    const splitPosition = line.indexOf(':');

    if (splitPosition === -1) {
        logger.error('[icsToJson] Invalid line in ICS');
        return;
    }

    const fieldName = line.substr(0, splitPosition);
    const fieldValue = line.substr(splitPosition + 1, line.length);

    switch (fieldName) {
        case 'UID': {
            const splittedUid = fieldValue.split('@');
            if (splittedUid.length === 2) {
                event['id'] = splittedUid[0];
            } else if (splittedUid.length ===1) {
                event['id'] = fieldValue;
            } else {
                logger.error('[icsToJson] Invalid UID');
            }
        }
            break;
        case 'LOCATION':
            event['location'] = fieldValue;
            break;
        case 'SUMMARY':
            event['summary'] = fieldValue;
            break;
        case 'DESCRIPTION': {
            const field = fieldName.toLowerCase();
            event[field] = fieldValue;
            break;
        }
        case 'DTSTART':
            event['dtstart'] = regularDateFormat(fieldValue);
            break;
        case 'DTEND':
            event['dtend'] = regularDateFormat(fieldValue);
            break;
        case 'DTSTAMP':
            event['dtstamp'] = regularDateFormat(fieldValue);
            break;
        case 'DURATION':
            event['duration'] = fieldValue;
            break;
        case 'LAST-MODIFIED':
            event['last-modified'] = regularDateFormat(fieldValue);
            break;
        case 'RRULE': {
            const repeatAttributes = fieldValue.split(';');
            for (let i = 0; i < repeatAttributes.length; i++) {
                const raName = (repeatAttributes[i].split('='))[0];
                const raValue = (repeatAttributes[i].split('='))[1];
                switch (raName) {
                    case 'FREQ':
                        event['repeat_freq'] = raValue;
                        break;
                    case 'UNTIL':
                        event['repeat_until'] = regularDateFormat(raValue);
                        break;
                    case 'COUNT':
                        event['repeat_count'] = raValue;
                        break;
                    case 'INTERVAL':
                        event['repeat_interval'] = raValue;
                        break;
                    case 'BYSECOND':
                        event['repeat_bysecond'] = raValue.split(',');
                        break;
                    case 'BYMINUTE':
                        event['repeat_byminute'] = raValue.split(',');
                        break;
                    case 'BYHOUR':
                        event['repeat_byhour'] = raValue.split(',');
                        break;
                    case 'BYDAY':
                        event['repeat_byday'] = raValue.split(',');
                        break;
                    case 'BYMONTHDAY':
                        event['repeat_bymonthday'] = raValue.split(',');
                        break;
                    case 'BYYEARDAY':
                        event['repeat_byyearday'] = raValue.split(',');
                        break;
                    case 'BYWEEKNO':
                        event['repeat_byweekno'] = raValue.split(',');
                        break;
                    case 'BYMONTH':
                        event['repeat_bymonth'] = raValue.split(',');
                        break;
                    case 'BYSETPOS':
                        event['repeat_bysetpos'] = raValue.split(',');
                        break;
                    case 'WKST':
                        event['repeat_wkst'] = raValue;
                        break;
                    default:
                        logger.error('[icsToJson] Invalid repeat attribute: ' + raName + ': ' + raValue);
                }
            }
        }
            break;
        case 'EXDATE':
            if (!Array.isArray(event['exdates']))
                event['exdates'] = [];
            event['exdates'].push(regularDateFormat(fieldValue));
            break;
        default: {
            // temporary for timezone support...
            const splitPosition2 = fieldName.indexOf(';');
            if (splitPosition2 === -1) {
                return;
            }
            const realFieldName = fieldName.substr(0, splitPosition2);
            // const timezone = fieldName.substr(splitPosition2 + 1, fieldName.length);

            // TODO: handle timezone

            switch (realFieldName) {
                case 'DTSTART':
                    event['dtstart'] = regularDateFormat(fieldValue);
                    break;
                case 'DTEND':
                    event['dtend'] = regularDateFormat(fieldValue);
                    break;
                case 'DTSTAMP':
                    event['dtstamp'] = regularDateFormat(fieldValue);
                    break;
                case 'LAST-MODIFIED':
                    event['last-modified'] = regularDateFormat(fieldValue);
                    break;
                case 'EXDATE':
                    if (!Array.isArray(event['exdates'])) {
                        event['exdates'] = [];
                    }
                    event['exdates'].push(regularDateFormat(fieldValue));
                    break;
                default:
                    logger.error('[icsToJson] Got unknown ICS field. Implement ' + fieldName);
                    break;
            }
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
        logger.error('[icsToJson] Invalid line in ICS (parsing alarm): ' + line);
        return;
    }

    const fieldName = line.substr(0, splitPosition);
    const fieldValue = line.substr(splitPosition + includeSplitPosition, line.length);

    switch (fieldName) {
        case 'TRIGGER':
            alarm['trigger'] = fieldValue;
            break;
        case 'REPEAT':
            alarm['repeat'] = parseInt(fieldValue);
            break;
        case 'DURATION':
            alarm['duration'] = fieldValue;
            break;
        case 'ACTION':
            alarm['action'] = fieldValue;
            break;
        case 'ATTACH':
            alarm['attach'] = fieldValue;
            break;
        case 'DESCRIPTION':
            alarm['description'] = fieldValue;
            break;
        case 'ATTENDEE':
            alarm['attendee'] = fieldValue;
            break;
        case 'SUMMARY':
            alarm['summary'] = fieldValue;
            break;
        default:
            logger.error('[icsToJson] Got unknown ICS field for alarm. Implement ' + fieldName);
            break;
    }
}

module.exports = icsToJson;
