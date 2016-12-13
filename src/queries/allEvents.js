const client = require('../models/database');

function allEvents() {
    return new Promise(function(resolve, reject) {
        client.query('SELECT * FROM events ORDER BY id ASC;', function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = allEvents;
