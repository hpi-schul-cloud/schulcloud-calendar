const client = require('../infrastructure/database');
const errorMessage = require('./utils/errorMessage');

function addAlarmToEvent(params) {
    return new Promise(function(resolve, reject) {
        const query = 'INSERT INTO alarms (event_id, trigger, repeat, duration, action, attach, description, attendee, summary) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
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

module.exports = addAlarmToEvent;
