const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const config = require('../config');

function _getRequest(url) {
    return new Promise(function(resolve, reject) {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'json';
        request.setRequestHeader('x-api-key', config.API_KEY);
        request.onload = function() {
            const httpStatus = request.status;
            if (httpStatus === 200) {
                resolve(request.responseText);
            } else {
                reject(httpStatus);
            }
        };
        request.send();
    });
}

module.exports = _getRequest;
