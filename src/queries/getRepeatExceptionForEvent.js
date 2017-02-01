const client = require('../models/database');
const errorMessage = require('./utils/errorMessage');
const iCalendarDateFormat = require('../parsers/iCalendarDateFormat');

function getRepeatExceptionForEvent(eventId) {
    return new Promise(function(resolve, reject) {
        const query = 'SELECT date FROM repetition_exception_dates WHERE event_id = $1';
        client.query(query, [eventId], function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows);
            }
        });
    });
}

function getRepeatExceptionsIcsForEvent(eventId) {
    return new Promise(function (resolve, reject) {
        Promise.resolve(getRepeatExceptionForEvent(eventId)).then(
            function (exceptions) {
                if (exceptions) {
                    if (exceptions.length === 0) {
                        resolve('');
                    }

                    let ics = '';
                    exceptions.map(function (exception) {
                        ics += 'EXDATE:' + iCalendarDateFormat(exception.date) + '\n';
                    });
                    resolve(ics);
                } else {
                    resolve('');
                }
            },
            reject.bind(null)
        );
    });
}

module.exports = {
    getRepeatExceptionForEvent: getRepeatExceptionForEvent,
    getRepeatExceptionsIcsForEvent: getRepeatExceptionsIcsForEvent
};
