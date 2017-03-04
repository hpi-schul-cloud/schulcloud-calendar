const logger = require('../../infrastructure/logger');

/**
 * Use for (GET) responses, for which JSON is expected
 * @param res
 * @param results
 */
function returnJSONResponse(res, results = '') {
    if (res && !res.headersSent) {
        const response = JSON.stringify(results);
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Content-Length': response.length
        });
        res.end(response);
    }
    else
        logger.error('res unavailable or headers already sent');
}

module.exports = returnJSONResponse;
