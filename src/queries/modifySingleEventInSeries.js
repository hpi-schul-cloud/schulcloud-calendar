const client = require('../infrastructure/database');
const errorMessage = require('./utils/errorMessage');

function modifySingleEventInSeries(params) {
    return new Promise(function(resolve, reject) {
        // TODO: get original event
        const query = 'INSERT INTO events (...) VALUES (...)';
        client.query(query, params, function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = modifySingleEventInSeries;