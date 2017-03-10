const client = require('../infrastructure/database');
const errorMessage = require('./utils/errorMessage');

function insertExdate(params) {
    return new Promise(function (resolve, reject) {
        // TODO: check if event exists
        // TODO: check if exception exists already
        const query = 'INSERT INTO exdates (event_id, date) VALUES ($1, $2) RETURNING id, event_id, date';
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

module.exports = insertExdate;
