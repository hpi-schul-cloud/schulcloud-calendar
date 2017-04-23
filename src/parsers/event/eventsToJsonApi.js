const config = require('../../config');
const validJson = require('../validators/validateEventJson');
const logger = require('../../infrastructure/logger');
const removeNullValues = require('../../utils/removeNullValues');

function eventsToJsonApi(eventJson) {
    eventJson = removeNullValues(eventJson);
    let validationResult = validJson(eventJson, false);
    if (validationResult !== true) {
        logger.error(`[jsonToJsonApi] Got invalid events JSON: ${validationResult}`);
        return;
    }

    return {
        // Enhancement: Handle pagination
        links: {
            self: `${config.ROOT_URL}/events`
        },
        data: eventJson.map(eventToJsonApi)
    };
}

function eventToJsonApi(event) {
    const jsonApiEvent = {
        type: 'event',
        id: event.id,
        attributes: {},
        relationships: {},
        included: [],
    };

    let rrule = {};

    // Rename event_id and delete both, id and event_id from object
    event.uid = event.event_id;
    delete event.event_id;
    delete event.id;

    for (let key in event) {
        if (event.hasOwnProperty(key)) {
            if (key.startsWith('repeat'))
                key = 'repeat';
            switch (key) {
                case 'repeat':
                    rrule[key.split('_')[1]] = event[key];
                    break;
                case 'alarms':
                    event[key].forEach(function (alarm) {
                        addAlarmToJsonApi(jsonApiEvent.included, alarm);
                    });
                    break;
                case 'exdates':
                    event[key].forEach(function (exdate) {
                        addExDateToJsonApi(jsonApiEvent.included, exdate);
                    });
                    break;
                case 'scope_ids':
                    jsonApiEvent.relationships['scope-ids'] = event[key];
                    break;
                case 'separate_users':
                    jsonApiEvent.relationships['separate-users'] = event[key];
                    break;
                case 'x_fields': {
                    const x_fields = event[key];
                    for (let x_field in x_fields) {
                        if (x_fields.hasOwnProperty(x_field))
                            jsonApiEvent.attributes[x_field] = x_fields[x_field];
                    }
                }
                    break;
                default:
                    jsonApiEvent.attributes[key] = event[key];
                    break;
            }
        }
    }

    addRRuleToJsonApi(jsonApiEvent.included, rrule, jsonApiEvent.id);

    removeEmptyRelationshipAndInclude(jsonApiEvent);

    return jsonApiEvent;
}


function addRRuleToJsonApi(includedArray, rrule, eventId) {
    if (Object.keys(rrule).length === 0) {
        return;
    }
    let rRuleJsonApi = {};
    rRuleJsonApi.type = 'rrule';
    rRuleJsonApi.id = `${eventId}-rrule`;
    rRuleJsonApi.attributes = rrule;
    includedArray.push(rRuleJsonApi);
}

function addExDateToJsonApi(includedArray, exdate) {
    let exDateJsonApi = {};
    exDateJsonApi.type = 'exdate';
    exDateJsonApi.id = exdate.id;
    exDateJsonApi.attributes = {};
    exDateJsonApi.attributes.timestamp = exdate.date;
    includedArray.push(exDateJsonApi);
}

function addAlarmToJsonApi(includedArray, alarm) {
    let alarmJsonApi = {};
    alarmJsonApi.type = 'alarm';
    alarmJsonApi.id = alarm.id;
    delete alarm.id;
    alarmJsonApi.attributes = alarm;
    includedArray.push(alarmJsonApi);
}

function removeEmptyRelationshipAndInclude(jsonApiEvent) {
    if (Object.keys(jsonApiEvent.relationships).length === 0) {
        delete jsonApiEvent.relationships;
    }

    if (jsonApiEvent.included.length === 0) {
        delete jsonApiEvent.included;
    }
}

module.exports = eventsToJsonApi;
