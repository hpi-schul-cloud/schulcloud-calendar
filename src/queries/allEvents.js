const client = require('../models/database');
const errorMessage = require('./errorMessage');

function allEvents() {
    return new Promise(function(resolve, reject) {
        const query = 'SELECT * FROM events ORDER BY id ASC;';
        client.query(query, function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = allEvents;
