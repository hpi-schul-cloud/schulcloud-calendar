const validJson = require('../validators/validateEventJson');
const returnError = require('../../utils/response/returnError');
const logger = require('../../infrastructure/logger');

function jsonApiToJson(req, res, next) {
    const jsonApiData = req.body.data;
    const events = [];

    jsonApiData.forEach(function (event) {
        if (event.type !== 'event') {
            returnError(res, "Only data of type 'event' allowed.", 400, 'Bad Request');
            return;
        }

        const eventAttributes = event.attributes;
        const eventRelationships = event.relationships;
        const eventIncluded = event.included;

        let json = {};

        json.id = eventAttributes.uid;
        delete eventAttributes.uid;

        for (let key in eventAttributes) {
            if (eventAttributes.hasOwnProperty(key)) {
                if (key.startsWith('X-')) {
                    if (!json['x_fields'])
                        json['x_fields'] = {};
                    json['x_fields'][key] = eventAttributes[key];
                } else {
                    json[key] = eventAttributes[key];
                }
            }
        }

        if (eventIncluded) {
            eventIncluded.forEach(function (includedObject) {
                switch (includedObject.type) {
                    case 'rrule':
                        addRRuleToJson(json, includedObject.attributes);
                        break;
                    case 'exdate':
                        addExDateToJson(json, includedObject.attributes);
                        break;
                    case 'alarm':
                        addAlarmToJson(json, includedObject.attributes);
                        break;
                    default:
                        logger.error('[jsonApiToJson] Got unknown included object.');
                }
            });
        }

        if (eventRelationships) {
            json.separate_users = eventRelationships['separate-users'];
            json.scope_ids = eventRelationships['scope-ids'];
        }

        events.push(json);
    });

    let validationResult = validJson(events, true, req.method);
    if (validationResult === true) {
        req.events = events;
        next();
    } else {
        returnError(res, `Invalid JSON API definition: ${validationResult}`, 400, 'Bad Request');
    }
}

function addRRuleToJson(json, rruleAttributes) {
    for (let key in rruleAttributes) {
        if (rruleAttributes.hasOwnProperty(key)) {
            json['repeat_' + key] = rruleAttributes[key];
        }
    }
}

function addExDateToJson(json, exDateAttributes) {
    if (!exDateAttributes.hasOwnProperty('timestamp')) {
        return;
    }

    if (!json.hasOwnProperty('exdates')) {
        json.exdates = [];
    }

    json.exdates.push(exDateAttributes.timestamp);
}


function addAlarmToJson(json, alarmAttributes) {
    if (!json.hasOwnProperty('alarms')) {
        json.alarms = [];
    }

    json.alarms.push(alarmAttributes);
}

module.exports = jsonApiToJson;
