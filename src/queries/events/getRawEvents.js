const getClient = require('../../infrastructure/database');
const isoDateFormat = require('../../utils/isoDateFormat');
const errorMessage = require('../utils/errorMessage');
const { allColumns } = require('./constants');
const {
	SCOPE_DISPLAY_OLD_EVENTS_FROM_LAST_DAYS,
	SCOPE_DISPLAY_OLD_EVENTS_UNTIL_DAYS,
	DAY_IN_MS,
} = require('../../config');

const FROM = () => new Date(new Date().getTime() - DAY_IN_MS * SCOPE_DISPLAY_OLD_EVENTS_FROM_LAST_DAYS);
const UNTIL = () => new Date(new Date().getTime() + DAY_IN_MS * SCOPE_DISPLAY_OLD_EVENTS_UNTIL_DAYS);

function getRawEvents(filter, scopes) {
	return new Promise((resolve, reject) => {
		const { query, params } = buildQuery(filter, scopes, reject);

		getClient().query(query, params, (error, result) => {
			if (error) {
				errorMessage(query, error);
				reject(error);
			} else {
				resolve(result.rows);
			}
		});
	});
}

function buildQuery(filter, scopes, reject) {
	let { scopeId, eventId, from, until, all } = filter;
	let query;
	let params;

	if (!scopeId && !eventId && !scopes) {
		reject('No scopeId or eventId for event selection given');
	}

	if (scopeId) {
		query = `SELECT ${allColumns} FROM events WHERE scope_id = $1`;
		params = [ scopeId ];
	}

	if (eventId) {
		query = `SELECT ${allColumns} FROM events WHERE event_id = $1`;
		params = [ eventId ];
	}

	//pass an array of scopes
	if (scopes) {
		query = `SELECT ${allColumns} FROM events WHERE scope_id = ANY($1)  `;
		params = [ Object.keys(scopes) ];
	}

	if (!all) {
		from = isoDateFormat(from || FROM());
		until = isoDateFormat(until || UNTIL());
		query = `${query} AND ((repeat_freq IS NOT NULL AND dtstart <= $2 AND repeat_until >= $3) OR (dtstart < $2 AND dtend > $3) )`;
		params = [ ...params, until, from];
	}

	query = `${query} ORDER BY id ASC;`;
	return { query, params };
}

module.exports = getRawEvents;
