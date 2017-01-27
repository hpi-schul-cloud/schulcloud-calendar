const client = require('../models/database');
const errorMessage = require('./utils/errorMessage');

function selectEvents(filter) {
    return new Promise(function(resolve, reject) {
        const { scopeId, eventId, from, until, all } = filter;

        if (!scopeId && !eventId) {
            reject(new Error('No scopeId or eventId for event selection given'));
        } else if (!all && (!from || !until)) {
            reject(new Error('No valid timespan given'));
        }

        const query = buildQuery(filter);

        client.query(query, (error, result) => {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

function buildQuery(filter) {
    let query;

    // filter either by scopeId or eventId
    if (scopeId) {
        query = `SELECT * FROM events WHERE reference_id = ${scopeId}`;
    } else {
        query = `SELECT * FROM events WHERE event_id = ${eventId}`;
    }

    // if all is not set, filter by timespan
    query = all
        ? query
        : `${query} AND dtstart > ${from} AND dtend < ${until}`;

    query = (joinAlarms(joinExdates(query)));
    return `${query} ORDER BY id ASC;`;
}

function joinAlarms(query) {
    // TODO implement
    return query;
}

function joinExdates(query) {
    // TODO implement
    return query;
}

module.exports = selectEvents;
