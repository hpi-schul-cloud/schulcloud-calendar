const client = require('../models/database');
const insertEvent = require('./_insertEvent');

function insertEvents(params, referenceIds) {
    return new Promise(function(resolve, reject) {
        var processedQueries = 0;
        Promise.all(referenceIds.map(function(referenceId) {
            const paramsClone = params.slice(0);
            paramsClone[5] = referenceId;
            insertEvent(paramsClone)
        })).then(
            function() {
                console.log('Successfully inserted events.');
                resolve();
            },
            function(error) {
                reject(error);
            }
        );
    });
}

module.exports = insertEvents;
