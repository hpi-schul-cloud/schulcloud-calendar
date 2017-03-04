const logger = require('../../infrastructure/logger');

/**
 * Use for 'Success' status response with content for verification purposes
 * @param res
 * @param results
 */
function returnSuccess(res, results = '') {
    if (res && !res.headersSent)
        res.status(200).send(`Success: ${JSON.stringify(results)}`);
    else
        logger.error('res unavailable or headers already sent');
}

module.exports = returnSuccess;
