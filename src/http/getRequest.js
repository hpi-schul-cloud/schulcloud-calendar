const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

function getRequest(url) {
    return new Promise(function(resolve, reject) {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'json';
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

module.exports = getRequest;
