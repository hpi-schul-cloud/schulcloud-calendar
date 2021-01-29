const { deleteDuplicatesForCourses } = require('../../queries/events/deleteEvents');
const logger = require('../../infrastructure/logger');

deleteDuplicatedEvents = async () => {
    try {
        logger.alert(`Starting deleting duplicated events for courses`);
        const result = await deleteDuplicatesForCourses();
        const count = result.length;
        logger.alert(`Successfully deleted ${count} duplicated events for courses`);
        return { count, data: result };
    } catch (e) {
        logger.alert(`Deleting of duplicated events failed: ${JSON.stringify(e)}`, e);
        throw e;
    }
}

module.exports = {
    deleteDuplicatedEvents
};