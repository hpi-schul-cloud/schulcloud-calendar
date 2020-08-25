const getClient = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');
const { allColumns } = require('./constants');

function deleteEvents(eventId, scopeId) {
    return new Promise(function(resolve, reject) {
        let params = [eventId];
        let query = 'DELETE FROM events WHERE event_id = $1 ';
        if (scopeId) {
            params = [...params, scopeId];
            query += 'AND scope_id = $2 ';
        }
        query += `RETURNING ${allColumns}`;
        getClient().query(query, params, function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows);
            }
        });
    });
}

module.exports = deleteEvents;
