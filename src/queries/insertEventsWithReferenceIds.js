const client = require('../models/database');
const insertEvent = require('./insertEvent');

function insertEventsWithReferenceIds(params, referenceIds) {
    return new Promise(function(resolve, reject) {
        var promisesForReferenceIds = [];
        for (var i = 0; i < referenceIds.length; i++) {
            const paramsClone = params.slice(0);
            paramsClone[5] = referenceIds[i];
            promisesForReferenceIds.push(insertEvent(paramsClone));
        }

        Promise.all(promisesForReferenceIds).then(function (results) {
                console.log('Successfully inserted events.');
                resolve(results);
            },
            function(error) {
                reject(error);
            }
        );
    });
}

module.exports = insertEventsWithReferenceIds;
