const client = require('../models/database');
const errorMessage = require('./utils/errorMessage');
const ensureISODate = require('../utils/ensureISODate');

const THREE_WEEKS = 1000 * 60 * 60 * 24 * 21;
const FROM = new Date(new Date().getTime() - THREE_WEEKS);
const UNTIL = new Date(new Date().getTime() + THREE_WEEKS);

function selectEvents(filter) {
    return new Promise(function(resolve, reject) {
        const { scopeId, eventId } = filter;

        if (!scopeId && !eventId) {
            reject(new Error('No scopeId or eventId for event selection given'));
        }

        const query = buildQuery(filter);

        client.query(query, (error, result) => {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows);
            }
        });
    });
}

function buildQuery(filter) {
    let { scopeId, eventId, from = FROM, until = UNTIL, all } = filter;
    let query;

    // ensure common date format
    from = ensureISODate(from);
    until = ensureISODate(until);

    // filter either by scopeId or eventId
    if (scopeId) {
        query = `SELECT * FROM events WHERE reference_id = '${scopeId}'`;
    } else {
        query = `SELECT * FROM events WHERE event_id = '${eventId}'`;
    }

    // if all is not set, filter by timespan
    query = all
        ? query
        : `${query} AND dtstart > '${from}' AND dtstart < '${until}'`;

    return `${query} ORDER BY id ASC;`;
}

module.exports = selectEvents;
