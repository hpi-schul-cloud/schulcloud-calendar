const client = require('../models/database');
const errorMessage = require('./utils/errorMessage');

function insertEvent(params) {
    return new Promise(function(resolve, reject) {
        const query = 'INSERT INTO events (summary, location, description, start_timestamp, end_timestamp, reference_id, created_timestamp, repeat, repeat_interval) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id';
        client.query(query, params, function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows[0].id);
            }
        });
    });
}

module.exports = insertEvent;