const client = require('../models/database');
const errorMessage = require('./errorMessage');

function allAlarmsForEvent(eventID) {
    return new Promise(function(resolve, reject) {
        const query = 'SELECT trigger, repeat, duration, action, attach, description, attendee, summary FROM alarms WHERE event_id = $1 ORDER BY id ASC;';
        client.query(query,[eventID], function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = allAlarmsForEvent;
