const consoleError = require('../utils/consoleError');
const validJson = require('../validators/validateJson');
const returnError = require('../routes/utils/returnError');


function jsonApiToJson(req, res, next) {
    const jsonApiData = req.body.data;
    const events = [];

    jsonApiData.forEach(function (event) {
        if (event.type != 'event') {
            return;
        }

        const eventAttributes = event.attributes;
        const eventRelationships = event.relationships;
        const eventIncluded = event.included;

        let json = {};

        for (let key in eventAttributes) {
            if (eventAttributes.hasOwnProperty(key)) {
                json[key] = eventAttributes[key];
            }
        }

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
                    consoleError('[jsonApiToJson] Got unknown included object.');
            }
        });

        json.separateUsers = eventRelationships['separate-users'];
        json.scopeIds = eventRelationships['scope-ids'];

        events.push(json);
    });

    if (validJson(events)) {
        req.events = events;
        next();
    } else {
        returnError(res, 'Invalid JSON API definition!', 400, 'Bad Request');
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

    if (!json.hasOwnProperty('exdate')) {
        json.exdate = [];
    }

    json.exdate.push(exDateAttributes.timestamp);
}


function addAlarmToJson(json, alarmAttributes) {
    if (!json.hasOwnProperty('alarm')) {
        json.alarm = [];
    }

    json.alarm.push(alarmAttributes);
}

module.exports = jsonApiToJson;