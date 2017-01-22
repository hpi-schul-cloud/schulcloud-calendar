const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const consoleError = require('../utils/consoleError');
const config = require('./config');

function newNotificationForScopeIds(title, body, token, scopeIds) {
    return new Promise(function(resolve, reject) {
        const request = new XMLHttpRequest();
        request.open('POST', config.NOTIFICATION_SERVICE_NEW_NOTIFICATION, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({
            title: title,
            body: body,
            token: token,
            scopeIds: scopeIds
        }));
        request.onload = function() {
            const httpStatus = request.status;
            if (httpStatus == 201) {
                resolve();
            } else {
                consoleError('Error status ' + httpStatus + ' while creating notification for scopeIds ' + JSON.stringify(scopeIds));
                reject(httpStatus);
            }
        };
        request.send();
    });
}

module.exports = newNotificationForScopeIds;
