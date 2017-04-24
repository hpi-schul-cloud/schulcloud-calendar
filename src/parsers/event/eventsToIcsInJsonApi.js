const config = require('./../../config');
const validateJson = require('../validators/validateEventJson');
const logger = require('../../infrastructure/logger');
const eventsToIcs = require('./eventsToIcs');

function eventsToIcsInJsonApi(eventJson) {
    let validationResult = validateJson(eventJson, false);
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
    return {
        type: 'event',
        id: event.id,
        attributes: {
            ics: eventsToIcs([event])
        }
    };
}

module.exports = eventsToIcsInJsonApi;
