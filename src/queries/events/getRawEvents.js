const db = require('../../infrastructure/databasePromise');
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

async function getRawEvents(filter, scopes) {
	const { query, params } = buildQuery(filter, scopes);
	const result = await db.query(query, params);
	return result;
}

const isInScope = (scopes = {}, scopeId) => Object.keys(scopes).some((id) => id === scopeId);

function buildQuery(filter, scopes) {
	let { scopeId, eventId, from, until } = filter;
	let query;
	let params = [];

	from = isoDateFormat(from || FROM());
	until = isoDateFormat(until || UNTIL());

	query = `SELECT ${allColumns} FROM events WHERE scope_id = `;

	if (scopeId) {
		if (isInScope(scopes, scopeId) === false) {
			throw new Error({
				message: 'Forbidden',
				code: 403,
				title: 'Foridden'
			});
		}
		query += '$1';
		params.push(scopeId);
	} else {
		query += 'ANY($1)';
		params.push(Object.keys(scopes));
	}

	if (eventId) {
		query += ' AND event_id = $2';
		params.push(eventId);
	}

	const length = params.length;
	const fromDate = `$${length+1}`;
	const untilDate = `$${length+2}`;

	const repeat = `(repeat_freq IS NOT NULL AND dtstart <= ${untilDate} AND repeat_until >= ${fromDate})`;
	// query += ` AND ((dtstart <= ${untilDate} AND dtend >= ${fromDate}) OR ${repeat})`;
	params.push(from);
	params.push(until);

	query += ' ORDER BY id ASC;';
	return { query, params };
}

/*
	const inTime = `(dtstart >= ${fromDate} AND dtend <= ${untilDate})`;
	const startBeforeAndEndAfter = `(dtstart < ${fromDate} AND dtend > ${untilDate})`;
	const startBeforeAndInTime = `(dtstart < ${fromDate} AND dtend <= ${untilDate})`;
	const startAfterAndEndAfter = `(dtstart < ${fromDate} AND dtend > ${untilDate})`;

	startBeforeAndInTime
	fromDate = 1
	untilDate = 3
	2 < 3 && 4 > 1
	----------------
	startBeforeAndEndAfter
	fromDate = 1
	untilDate = 5
	2 < 5 && 4 > 1
	-------------
	inTime
	fromDate = 3
	untilDate = 3
	2 < 3 && 4 > 3
	------------
	startAfterAndEndAfter
	fromDate = 3
	untilDate = 5
	2 < 5 && 4 > 3
	-------------
	dtstart = 2
	dtend = 4
	
	`dtstart < untilDate AND dtend > fromDate`;
*/
module.exports = getRawEvents;
