const client = require('../../infrastructure/database');
const isoDateFormat = require('../../utils/isoDateFormat');
const errorMessage = require('../utils/errorMessage');
const { allColumns } = require('./constants');

const DAY = 1000 * 60 * 60 * 24;
const WEEK = DAY * 7;
const YEAR = DAY * 365;
const FROM = () => new Date(new Date().getTime() - WEEK * 3);
const UNTIL = () => new Date(new Date().getTime() + YEAR * 2);

function getRawEvents(filter) {
    return new Promise((resolve, reject) => {
        const { query, params } = buildQuery(filter, reject);

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

function buildQuery(filter, reject) {
    let { scopeId, eventId, from, until } = filter;
    let query;
    let params;

    if (!scopeId && !eventId) {
        reject('No scopeId or eventId for event selection given');
    }

    if (scopeId) {
        from = isoDateFormat(from || FROM());
        until = isoDateFormat(until || UNTIL());
        query = `SELECT ${allColumns} FROM events WHERE scope_id = $1 AND dtstart > $2 AND dtstart < $3`;
        params = [ scopeId, from, until ];
    } 

    if (eventId) {
        query = `SELECT ${allColumns} FROM events WHERE event_id = $1`;
        params = [ eventId ];
    } 

    query = `${query} ORDER BY id ASC;`;
    return { query, params };
}

module.exports = getRawEvents;
