const validJson = require('../validators/validateJson');
const logger = require('../infrastructure/logger');


function eventsToJsonApi(eventJson) {
    if (!validJson(eventJson)) {
        logger.error('[jsonToJsonApi] Got invalid events JSON!');
        return;
    }

    return {
        // TODO: Handle pagination
        links: {
            self: 'https://schul-cloud.org:3000/events',
            next: '',
            prev: '',
            first: '',
            last: ''
        },
        data: eventJson.map(eventToJsonApi)
    };
}

function eventToJsonApi(event) {
    const jsonApiEvent = {};
    jsonApiEvent.type = 'event';
    jsonApiEvent.id = ''; // TODO: Insert ID
    jsonApiEvent.attributes = {};
    jsonApiEvent.relationships = {};
    jsonApiEvent.included = [];
    let rrule = {};

    // Rename event_id and delete both, id and event_di from object
    event.uid = event.event_id;
    delete event.event_id;
    delete event.id;

    for (let key in event) {
        if (event.hasOwnProperty(key)) {
            switch (key.split('_')[0]) {
                case 'repeat':
                    rrule[key.split('_')[1]] = event[key];
                    break;
                case 'alarm':
                    event[key].forEach(function (alarm) {
                        addAlarmToJsonApi(jsonApiEvent.included, alarm);
                    });
                    break;
                case 'exdate':
                    event[key].forEach(function (exdate) {
                        addExDateToJsonApi(jsonApiEvent.included, exdate);
                    });
                    break;
                case 'scopeIds':
                    jsonApiEvent.relationships['scope-ids'] = event[key];
                    break;
                case 'separateUsers':
                    jsonApiEvent.relationships['separate-users'] = event[key];
                    break;
                default:
                    jsonApiEvent.attributes[key] = event[key];
                    break;
            }
        }
    }

    addRRuleToJsonApi(jsonApiEvent.included, rrule);

    return jsonApiEvent;
}


function addRRuleToJsonApi(includedArray, rrule) {
    let rRuleJsonApi = {};
    rRuleJsonApi.type = 'rrule';
    rRuleJsonApi.id = ''; // TODO: Insert ID
    rRuleJsonApi.attributes = rrule;
    includedArray.push(rRuleJsonApi);
}

function addExDateToJsonApi(includedArray, exdate) {
    let exDateJsonApi = {};
    exDateJsonApi.type = 'exdate';
    exDateJsonApi.id = ''; // TODO: Insert ID
    exDateJsonApi.attributes = {};
    exDateJsonApi.attributes.timestamp = exdate;
    includedArray.push(exDateJsonApi);
}

function addAlarmToJsonApi(includedArray, alarm) {
    let alarmJsonApi = {};
    alarmJsonApi.type = 'alarm';
    alarmJsonApi.id = ''; // TODO: Insert ID
    alarmJsonApi.attributes = alarm;
    includedArray.push(alarmJsonApi);
}

module.exports = eventsToJsonApi;
