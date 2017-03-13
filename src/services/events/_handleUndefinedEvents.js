const logger = require('../../infrastructure/logger');

/**
 * Logs warnings if not all events were processed
 * @param processedEvents
 * @param action (one of 'modification', 'deletion')
 */
function handleUndefinedEvents(processedEvents, action) {
    const undefinedEvents = processedEvents.filter((event) => {
        return typeof event === 'undefined';
    });
    const isIncompleteDeletion = (undefinedEvents.length > 0)
        && (undefinedEvents.length !== processedEvents.length);
    if (isIncompleteDeletion) {
        const warning = `Only ${processedEvents.length - undefinedEvents.length} `
            + `out of ${processedEvents.length} scope-ids found `
            + `for event ${action}`;
        logger.warn(warning);
    }
}

module.exports = handleUndefinedEvents;
