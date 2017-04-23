const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const config = require('./../config');

function sendNotification(title, body, scopeIds) {
    return new Promise(function(resolve, reject) {
        const request = new XMLHttpRequest();
        request.open('POST', config.NOTIFICATION_SERVICE_NEW_NOTIFICATION, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function() {
            const httpStatus = request.status;
            if (httpStatus === 201) {
                resolve();
            } else {
                try {
                    reject(JSON.parse(request.responseText));
                } catch(exception) {
                    reject(JSON.parse(`{"name": "Exception", "code": ${request.status}, 
                        "message": "The error was not JSON formatted so that no detailed error message could be extracted."}`))
                }
            }
        };
        request.send(JSON.stringify({
            schulcloudId: config.NOTIFICATION_SCHULCLOUD_ID,
            title: title,
            body: body,
            token: config.NOTIFICATION_SERVICE_TOKEN,
            scopeIds: scopeIds
        }));
    });
}

module.exports = sendNotification;
