const client = require('../models/database');
const errorMessage = require('./errorMessage');

function insertAlarmForEvent(params, eventId) {
    return new Promise(function(resolve, reject) {
        const query = 'INSERT INTO alarms (event_id, trigger, repeat, duration, action, attach, description, attendee, summary) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
        client.query(query, [eventId] + params, function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = insertAlarmForEvent;
