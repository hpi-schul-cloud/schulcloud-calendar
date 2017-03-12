const client = require('../../infrastructure/database');
const isoDateFormat = require('../../utils/isoDateFormat');
const errorMessage = require('../_errorMessage');

const THREE_WEEKS = 1000 * 60 * 60 * 24 * 21;
const FROM = new Date(new Date().getTime() - THREE_WEEKS);
const UNTIL = new Date(new Date().getTime() + THREE_WEEKS);

function getRawEvents(filter) {
    return new Promise((resolve, reject) => {
        const { scopeId, eventId } = filter;

        if (!scopeId && !eventId) {
            reject('No scopeId or eventId for event selection given');
        }

        const { query, params } = buildQuery(filter);

        client.query(query, params, (error, result) => {
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
    let params;

    // ensure common date format
    from = isoDateFormat(from);
    until = isoDateFormat(until);

    // filter either by scopeId or eventId
    if (scopeId) {
        query = 'SELECT * FROM events WHERE scope_id = $1';
        params = [ scopeId ];
    } else {
        query = 'SELECT * FROM events WHERE event_id = $1';
        params = [ eventId ];
    }

    // if all is not set, filter by timespan
    if (!all) {
        query = `${query} AND dtstart > $2 AND dtstart < $3`;
        params = [ ...params, from, until ];
    }

    query = `${query} ORDER BY id ASC;`;
    return { query, params };
}

module.exports = getRawEvents;
