const logger = require('../infrastructure/logger');

/**
 * Logs warnings if not all events were processed
 * @param processedEvents
 * @param action (one of 'modification', 'deletion')
 */
function handleUndefinedObjects(processedEvents, action, object) {
    const undefinedEvents = processedEvents.filter((event) => {
        return typeof event === 'undefined';
    });
    const isIncompleteDeletion = (undefinedEvents.length > 0)
        && (undefinedEvents.length !== processedEvents.length);
    if (isIncompleteDeletion) {
        const deletions = processedEvents.length - undefinedEvents.length;
        const warning = `${object} ${action} incomplete, ${deletions} of `
            + `${processedEvents.length} queries successful`;
        logger.warning(warning);
    }
}

module.exports = handleUndefinedObjects;
