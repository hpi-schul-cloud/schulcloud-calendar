const deleteEvents = require('../../queries/events/deleteEvents');

async function deleteEventWithScope(eventId, scopes) {
	if (!scopes) {
		const err = {
			message: `ScopeId is missing.`,
			status: 400,
			title: 'Bad Request',
		}
		throw err;
	}

	const result = await deleteEvents(eventId, Object.keys(scopes));
	return result;
}

module.exports = deleteEventWithScope;