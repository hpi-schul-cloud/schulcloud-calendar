const client = require('../infrastructure/database');
const errorMessage = require('./utils/errorMessage');

function insertEvent(params) {
    return new Promise(function(resolve, reject) {
        const query = 'INSERT INTO events (summary, location, description, dtstart, dtend, reference_id, dtstamp, repeat_freq, repeat_until, repeat_count, repeat_interval, repeat_bysecond, repeat_byminute, repeat_byhour, repeat_byday, repeat_bymonthday, repeat_byyearday, repeat_byweekno, repeat_bymonth, repeat_bysetpos, repeat_wkst, event_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING id, event_id';
        client.query(query, params, function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows[0]);
            }
        });
    });
}

module.exports = insertEvent;
