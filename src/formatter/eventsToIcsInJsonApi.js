const config = require('./../config');
const validJson = require('../validators/validateJson');
const logger = require('../infrastructure/logger');
const eventsToIcs = require('./eventsToIcs');

function eventsToIcsInJsonApi(eventJson) {
    let validationResult = validJson(eventJson, false);
    if (validationResult !== true) {
        logger.error(`[jsonToIcsInJsonApi] Got invalid events JSON: ${validationResult}`);
        return;
    }

    return {
        // Enhancement: Handle pagination
        links: {
            self: `${config.ROOT_URL}/events`
        },
        data: eventJson.map(eventToIcsInJsonApi)
    };
}

function eventToIcsInJsonApi(event) {
    const jsonApiEvent = {};
    jsonApiEvent.type = 'event';
    jsonApiEvent.id = event.id;
    jsonApiEvent.attributes = {};
    jsonApiEvent.attributes.ics = eventsToIcs([event]);

    return jsonApiEvent;
}

module.exports = eventsToIcsInJsonApi;
