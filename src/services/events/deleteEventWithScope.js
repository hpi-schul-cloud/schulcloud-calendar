const { deleteEvents, deleteEventsForScope } = require('../../queries/events/deleteEvents');

const validateScopes = (scopes) => {
	if (!scopes) {
		const err = {
			message: `ScopeId is missing.`,
			status: 400,
			title: 'Bad Request',
		}
		throw err;
	}
};

deleteAllEventsForScope = async (scope) => {
	validateScopes(scope);
	return deleteEventsForScope(scope);
}

deleteEventWithScope = async (eventId, scopes) => {
	validateScopes(scopes);
	return deleteEvents(eventId, Object.keys(scopes));
}

module.exports = {
	deleteEventWithScope,
	deleteAllEventsForScope
};