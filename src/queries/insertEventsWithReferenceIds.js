const client = require('../models/database');
const insertEvent = require('./insertEvent');

function insertEventsWithReferenceIds(params, referenceIds) {
    return new Promise(function(resolve, reject) {

        var processedQueries = 0;
        referenceIds.forEach(function(referenceId) {
            const paramsClone = params.slice(0);
            paramsClone[5] = referenceId;            //$6: reference_id
            Promise.resolve(insertEvent(paramsClone)).then(
                function(result) {
                    console.log('Successfully created Event entry in DB');
                    processedQueries++;
                    if (processedQueries == referenceIds.length) {
                        resolve();
                    }
                },
                function (error) {
                    console.error('Error during SQL INSERT query');
                    console.error(error);
                    reject(error);
                });
        });
    });
}

module.exports = insertEventsWithReferenceIds;
