function prepareOriginalEvent(insertedEvent) {
    let originalEvents = removeIds(insertedEvent);
    if (originalEvents.alarms)
        originalEvents.alarms = originalEvents.alarms.map(removeIds);
    if (originalEvents.exdates)
        originalEvents.exdates = originalEvents.exdates.map(removeIds);
    return JSON.stringify(originalEvents);

    function removeIds(object) {
        if (object) {
            return Object.keys(object).reduce((newObject, property) => {
                if (['id', 'scope_id', 'event_id'].includes(property)) {
                    return newObject;
                }
                newObject[property] = object[property];
                return newObject;
            }, {});
        }
    }
}

module.exports = prepareOriginalEvent;
