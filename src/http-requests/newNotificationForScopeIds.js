const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const config = require('./../config');

function newNotificationForScopeIds(title, body, scopeIds) {
    return new Promise(function(resolve, reject) {
        const request = new XMLHttpRequest();
        request.open('POST', config.NOTIFICATION_SERVICE_NEW_NOTIFICATION, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({
            schulcloudId: config.NOTIFICATION_SCHULCLOUD_ID,
            title: title,
            body: body,
            token: config.NOTIFICATION_SERVICE_TOKEN,
            scopeIds: scopeIds
        }));
        request.onload = function() {
            const httpStatus = request.status;
            if (httpStatus == 201) {
                resolve();
            } else {
                // TODO handle rejection
                reject(httpStatus);
            }
        };
        request.send();
    });
}

module.exports = newNotificationForScopeIds;
