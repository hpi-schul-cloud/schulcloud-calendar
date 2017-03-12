const client = require('../../infrastructure/database');
const errorMessage = require('../_errorMessage');

function insertOriginalEvent(eventId, originalScopeId) {
    return new Promise(function (resolve, reject) {
        const query = 'INSERT INTO eventid_originalscopeid (event_id, original_scope_id) VALUES ($1, $2)';
        client.query(query, [eventId, originalScopeId], function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows[0]);
            }
        });
    });
}

module.exports = insertOriginalEvent;
