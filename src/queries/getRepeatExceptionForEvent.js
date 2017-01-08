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
                resolve(result);
            }
        });
    });
}

function getRepeatExceptionsIcsForEvent(eventId) {
    return new Promise(function (resolve, reject) {
        Promise.resolve(getRepeatExceptionForEvent(eventId)).then(
            function (queryResult) {
                if (queryResult) {
                    const exceptions = queryResult.rows;
                    if (exceptions.length === 0) {
                        resolve('');
                    }

                    var ics = '';

                    exceptions.map(function (exception) {
                        ics += 'EXDATE:' + iCalendarDateFormat(exception.date) + '\n';
                    });
                    console.log(ics);
                    resolve(ics);
                } else {
                    resolve('');
                }
            },
            reject.bind(null)
        )
    });
}

module.exports = {
    getRepeatExceptionForEvent: getRepeatExceptionForEvent,
    getRepeatExceptionsIcsForEvent: getRepeatExceptionsIcsForEvent
};