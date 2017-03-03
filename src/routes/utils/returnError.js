const logger = require('../../logging/logger');

function returnError(res, error, status = 500, title = 'Internal Server Error') {
    const errorMessage = {
        errors: [{
            detail: error || '',
            title,
            status
        }]
    };

    if (error) {
        console.error('DEBUG: ' + error);
        logger.error(error);
    }

    if (res && !res.headersSent)
        res.contentType('application/json').status(status).send(errorMessage);
    else
        logger.error('res unavailable or headers already sent');
}

module.exports = returnError;
