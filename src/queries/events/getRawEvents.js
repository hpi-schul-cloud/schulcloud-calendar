const db = require('../../infrastructure/databasePromise');
const isoDateFormat = require('../../utils/isoDateFormat');
const errorMessage = require('../utils/errorMessage');
const { allColumns } = require('./constants');
const {
	SCOPE_DISPLAY_OLD_EVENTS_FROM_LAST_DAYS,
	SCOPE_DISPLAY_OLD_EVENTS_UNTIL_DAYS,
	DAY_IN_MS,
} = require('../../config');

const getDate = (offset) => new Date(new Date().getTime() + offset);
const formatDate = (date) => {
	return date.toISOString().replace('T', ' ')+' +'+(date.getTimezoneOffset()/60)*-1;
}
const FROM = () => getDate(- DAY_IN_MS * SCOPE_DISPLAY_OLD_EVENTS_FROM_LAST_DAYS);
const UNTIL = () => getDate(DAY_IN_MS * SCOPE_DISPLAY_OLD_EVENTS_UNTIL_DAYS);

async function getRawEvents(filter, scopes) {
	const { query, params } = buildQuery(filter, scopes);
	return db.query(query, params);
}

const isInScope = (scopes = {}, scopeId) => Object.keys(scopes).some((id) => id === scopeId);

function buildQuery(filter, scopes) {
	let { scopeId, eventId, from, until } = filter;
	let query;
	let params = [];
	from = formatDate(from || FROM());
	until = formatDate(until || UNTIL());

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
	const fromDate = `$${length}`;
	const untilDate = `$${length+1}`;
	// TODO make it shorter
	const inTime = `(dtstart >= ${fromDate} AND dtend <= ${untilDate})`;
	const startBeforeAndEndAfter = `(dtstart < ${fromDate} AND dtend > ${untilDate})`;
	const startBeforeAndInTime = `(dtstart < ${fromDate} AND dtend <= ${untilDate})`;
	const startAfterAndEndAfter = `(dtstart < ${fromDate} AND dtend > ${untilDate})`;
	query += ` AND (${inTime} OR ${startBeforeAndEndAfter} OR ${startBeforeAndInTime} OR ${startAfterAndEndAfter})`;
	params.push(from);
	params.push(until);

	query += ' ORDER BY id ASC;';
	return { query, params };
}

module.exports = getRawEvents;
