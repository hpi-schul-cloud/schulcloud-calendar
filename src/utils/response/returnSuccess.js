const logger = require('../../infrastructure/logger');

/**
 * Use for 'Success' status response with content for verification purposes
 * @param res
 * @param code
 * @param content
 */
function returnSuccess(res, code, content) {
	if (res && !res.headersSent) {
		const message = content
			? JSON.stringify(content)
			: `{"Statuscode": ${code}}`;
		res.contentType('application/json').status(code).send(message);
	}
	else
		logger.error('res unavailable or headers already sent');
}

module.exports = returnSuccess;
