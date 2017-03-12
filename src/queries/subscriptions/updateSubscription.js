const client = require('../../infrastructure/database');
const errorMessage = require('../_errorMessage');
const paramsTemplate = require('../_paramsTemplate');
const columnNames = require('./_columnNames');

// NOTE: delete needs to be called before, otherwise the id won't be unique anymore
function udpdateSubscription(params) {
    return new Promise(function(resolve, reject) {
        const query = `INSERT INTO subscriptions (id, ${columnNames}) `
            + `VALUES ${paramsTemplate(columnNames, true)} `
            + `RETURNING id, ${columnNames}`;
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

module.exports = udpdateSubscription;
