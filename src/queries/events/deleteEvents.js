const db = require('../../infrastructure/databasePromise');
const { allColumns } = require('./constants');

async function deleteEvents(eventId, scopeIds) {
	const query = `DELETE FROM events WHERE event_id = $1 AND scope_id = ANY($2) RETURNING ${allColumns}`;
	const params = [eventId, scopeIds];

	return db.query(query, params);
}

async function deleteEventsForScope(scopeId) {
	const query = `DELETE FROM events WHERE scope_id = $1 RETURNING ${allColumns}`;
	const params = [scopeId];

	return db.query(query, params);
}

async function deleteDuplicatesForCourses() {
	const query = `DELETE FROM events
				   WHERE x_fields ->> 'x-sc-courseId' is not null and repeat_wkst is not null
					 and id not in (
					   SELECT id
					   FROM (
								-- query to find max last-modified value for each duplication group
								SELECT scope_id, dtstart, dtend, repeat_wkst, MAX("last-modified") as lastmod
								from events
								group by scope_id, dtstart, dtend, repeat_wkst) as dup
								JOIN
							-- join with events table to get ids of the duplicates based on duplicate attributes 
							-- and last modification
								events as e
							ON dup.scope_id = e.scope_id and
							   dup.dtstart = e.dtstart and
							   dup.repeat_wkst = e.repeat_wkst and
							   dup.dtend = e.dtend and
							   dup.lastmod = e."last-modified"
				   ) RETURNING event_id`;
	return db.query(query);
}

module.exports = {
	deleteEvents,
	deleteEventsForScope,
	deleteDuplicatesForCourses,
};
