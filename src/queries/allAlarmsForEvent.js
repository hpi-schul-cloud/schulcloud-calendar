const client = require('../models/database');
const errorMessage = require('./utils/errorMessage');

function allAlarmsForEvent(eventId) {
    return new Promise(function(resolve, reject) {
        const query = 'SELECT trigger, repeat, duration, action, attach, description, attendee, summary FROM alarms WHERE event_id = $1 ORDER BY id ASC;';
        client.query(query,[eventId], function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows);
            }
        });
    });
}

function getAlarmsIcsForEvent(eventId) {
    return new Promise(function (resolve, reject) {
        Promise.resolve(allAlarmsForEvent(eventId)).then(
            function (alarms) {
                if (alarms.length === 0) {
                    resolve('');
                }

                let ics = '';

                alarms.map(function (alarm) {
                    ics += 'BEGIN:VALARM\n';

                    ics += 'TRIGGER';
                    if (!alarm.trigger.startsWith(';')) {
                        ics += ':';
                    }
                    ics += alarm.trigger + '\n';

                    if (alarm.repeat && alarm.duration) {
                        ics += 'REPEAT:' + alarm.repeat + '\n';
                        ics += 'DURATION:' + alarm.duration + '\n';
                    }

                    ics += 'ACTION:' + alarm.action + '\n';

                    if (alarm.attach) {
                        ics += 'ATTACH:' + alarm.attach + '\n';
                    }

                    if (alarm.description) {
                        ics += 'DESCRIPTION:' + alarm.description + '\n';
                    }

                    if (alarm.attendee) {
                        ics += 'ATTENDEE:' + alarm.attendee + '\n';
                    }

                    if (alarm.summary) {
                        ics += 'SUMMARY:' + alarm.summary + '\n';
                    }

                    ics += 'END:VALARM\n';
                });
                resolve(ics);
            },
            reject.bind(null)
        )
    });
}

module.exports = {
    allAlarmsForEvent: allAlarmsForEvent,
    getAlarmsIcsForEvent: getAlarmsIcsForEvent
};
