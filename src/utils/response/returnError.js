const logger = require('../../infrastructure/logger');

/**
 * Use for 'Error' status response with an error message
 * @param res
 * @param error
 * @param status
 * @param title
 */
function returnError(res, error, status = 500, title = 'Internal Server Error') {
    // TODO: In case of an 404 error, the title is not changed (but should).
    const errorMessage = {
        errors: [{
            detail: error || '',
            title,
            status
        }]
    };

    if (error) {
        logger.error(error);
    }

    if (res && !res.headersSent)
        res.contentType('application/json').status(status).send(errorMessage);
    else
        logger.error('res unavailable or headers already sent');
}

module.exports = returnError;
