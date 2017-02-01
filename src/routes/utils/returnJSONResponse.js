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
        res.send(response);
    }
    else
        console.error('res unavailable or headers already sent');
}

module.exports = returnJSONResponse;
