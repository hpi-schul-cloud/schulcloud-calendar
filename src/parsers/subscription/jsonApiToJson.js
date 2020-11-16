const validateJson = require('../validators/validateSubscriptionJson');

function jsonApiToJson(req, res, next) {
	const subscriptions = req.body.data.map((subscription) => {
		let json = {};
		if (req.method !== 'DELETE') {
			json.ics_url = subscription.attributes['ics-url'];
			json.description = subscription.attributes['description'];
			json.separate_users = subscription.relationships['separate-users'];
		}
		if (subscription.relationships) {
			json.scope_ids = subscription.relationships['scope-ids'];
		}
		return json;
	});

	let validationResult = validateJson(subscriptions, true, req.method);
	if (validationResult === true) {
		req.subscriptions = subscriptions;
		next();
	} else {
		const err = {
			message: `Invalid JSON API definition: ${validationResult}`,
			status: 400,
			title: 'Bad Request',
		}
		next(err);
	}
}

module.exports = jsonApiToJson;
