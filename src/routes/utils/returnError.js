const logger = require('../../logging/logger');

function returnError(res, error, status = 500, title = 'Internal Server Error') {
    let errorMessage;
    if (error) {
        console.log('DEBUG: ' + error);
        errorMessage = {
            errors: [{
                detail: error,
                title,
                status
            }]
        }
        logger.error(error);
    }
    if (res && !res.headersSent)
        res.contentType('application/json').status(status).send(errorMessage);
    else
        logger.error('res unavailable or headers already sent');
}

module.exports = returnError;
