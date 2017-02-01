const getAllUsersForUUID = require('../../http-requests/index.js').getAllUsersForUUID;
const addRepeatExceptionToEvent = require('../../queries/addRepeatExceptionToEvent');
const addAlarmToEvent = require('../../queries/addAlarmToEvent');
const insertEvents = require('../../queries/insertEvents');

function handleJson(json, separateUsers, scopeIds, externalEventId) {

    return new Promise(function (resolve, reject) {
        /*
         * json contains id, summary, location, description, dtstart, dtend
         * reference_id, dtstamp, last-modified, repeat, repeat_interval, alarms Array
         */
        const params = [];
        params[0] = json['summary'];            //$1: summary
        params[1] = json['location'];           //$2: location
        params[2] = json['description'];        //$3: description
        params[3] = json['dtstart'];            //$4: dtstart
        params[4] = json['dtend'];              //$5: dtend
        params[6] = json['dtstamp'];            //$7: dtstamp
        params[7] = json['repeat_freq'];        //$8: repeat_freq
        params[8] = json['repeat_until'];       //$9: repeat_until
        params[9] = json['repeat_count'];       //$10: repeat_count
        params[10] = json['repeat_interval'];   //$11: repeat_interval
        params[11] = json['repeat_bysecond'];   //$12: repeat_bysecond
        params[12] = json['repeat_byminute'];   //$13: repeat_byminute
        params[13] = json['repeat_byhour'];     //$14: repeat_byhour
        params[14] = json['repeat_byday'];      //$15: repeat_byday
        params[15] = json['repeat_bymonthday']; //$16: repeat_bymonthday
        params[16] = json['repeat_byyearday'];  //$17: repeat_byyearday
        params[17] = json['repeat_byweekno'];   //$18: repeat_byweekno
        params[18] = json['repeat_bymonth'];    //$19: repeat_bymonth
        params[19] = json['repeat_bysetpos'];   //$20: repeat_bysetpos
        params[20] = json['repeat_wkst'];       //$21: repeat_wkst
        params[21] = externalEventId;          //$22: event_id

        const promises = [];
        if (separateUsers === true) {
            scopeIds.forEach(function(scopeId) {
                promises.push(seperateEvents(json, scopeId, params));
            });
        } else {
            promises.push(insertEventForScopeIds(json, params, scopeIds));
        }

        Promise.all(promises).then(
            resolve.bind(null),
            reject.bind(null)
        );
    });
}

function seperateEvents(json, scopeId, params) {
    return new Promise(function (resolve, reject) {
        Promise.resolve(getAllUsersForUUID(scopeId)).then(
            function (usersResponse) {
                const usersJson = JSON.parse(usersResponse);
                const users = usersJson.data;

                if(!Array.isArray(users)) {
                    reject('Got invalid server response (expected an array of scopeIds)');
                }
                const referenceIds = users.map(function(user) {
                    return user.id;
                });

                Promise.resolve(insertEventForScopeIds(json, params, referenceIds)).then(
                    resolve.bind(null),
                    reject.bind(null)
                );
            },
            reject.bind(null)
        );
    });
}

function insertEventForScopeIds(json, params, scopeIds) {
    return new Promise(function (resolve, reject) {
        Promise.resolve(insertEvents(params, scopeIds)).then(
            function (results) {
                // TODO: check if result is uuid
                if (Array.isArray(results)) {
                    addExdates(json, results);
                    addAlarms(json, results);
                    resolve({eventId: results[0].event_id, scopeIds: scopeIds, summary: params[0], start: params[3], end: params[4]});
                } else {
                    reject();
                }
            },
            reject.bind(null)
        );
    });
}

function addExdates(json, results) {
    // check if exception dates for possible repeat exist
    // TODO: if so, check if repeat is set because of consistency reasons...
    if (Array.isArray(json['exdate'])) {
        const exdates = json['exdate'];
        for (let i = 0; i < exdates.length; i++) {
            for (let j = 0; j < results.length; j++) {
                const params = [];
                params[0] = results[j].id;
                params[1] = exdates[i];
                addRepeatExceptionToEvent(params);
            }
        }
    }
}

function addAlarms(json, results) {
    if (Array.isArray(json['alarms'])) {
        json['alarms'].forEach(function(alarm) {
            results.forEach(function(createdEvent) {
                let params = [];
                params[0] = createdEvent.id;
                params[1] = alarm['trigger'];
                params[2] = alarm['repeat'];
                params[3] = alarm['duration'];
                params[4] = alarm['action'];
                params[5] = alarm['attach'];
                params[6] = alarm['description'];
                params[7] = alarm['attendee'];
                params[8] = alarm['summary'];
                addAlarmToEvent(params);
            });
        });
    }
}

module.exports = handleJson;
