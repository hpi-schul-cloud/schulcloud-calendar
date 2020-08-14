const getClient = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');
const { allColumns } = require('./constants');

function getOriginalEvent(param) {
    return new Promise(function (resolve, reject) {
        const query = `SELECT ${allColumns} FROM original_events WHERE event_id = $1`;
        getClient().query(query, [ param ], function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
                resolve(result.rows);
            }
        });
    });
}

module.exports = getOriginalEvent;
