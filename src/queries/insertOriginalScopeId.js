const client = require('../infrastructure/database');
const errorMessage = require('./utils/errorMessage');

function insertOriginalScopeId(eventId, originalReferenceId) {
    return new Promise(function (resolve, reject) {
        const query = 'INSERT INTO eventid_originalreferenceid (event_id, original_scope_id) VALUES ($1, $2)';
        client.query(query, [eventId, originalReferenceId], function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows[0]);
            }
        });
    });
}

module.exports = insertOriginalScopeId;
