const getClient = require('../../../infrastructure/database');
const errorMessage = require('../../utils/errorMessage');
const { allColumns } = require('./constants');

function getAlarms(eventId) {
    return new Promise(function(resolve, reject) {
        const query = `SELECT ${allColumns} `
            + 'FROM alarms WHERE event_id = $1 ORDER BY id ASC;';
        getClient().query(query, [eventId], function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows);
            }
        });
    });
}

module.exports = getAlarms;
