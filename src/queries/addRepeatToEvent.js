const client = require('../models/database');
const errorMessage = require('./errorMessage');

function addRepeatToEvent(params) {
    return new Promise(function(resolve, reject) {
        const query = 'UPDATE \"events\" SET repeat = $2, repeat_interval = $3 WHERE id = $1';
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

module.exports = addRepeatToEvent;