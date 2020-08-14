const getClient = require('../../../infrastructure/database');
const errorMessage = require('../../utils/errorMessage');
const { allColumns } = require('./constants');

function getExdates(eventId) {
    return new Promise(function(resolve, reject) {
        const query = `SELECT ${allColumns} `
            + 'FROM exdates WHERE event_id = $1 ORDER BY id ASC;';
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

module.exports = getExdates;
