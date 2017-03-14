const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const cors = require('cors');
const config = require('../config');
const corsOptions = {
    origin: config.CORS_ORIGIN
};
router.use(cors(corsOptions));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// authentication, authorization and preprocessing
const { authenticateFromHeaderField } = require('../security/authentication');
const { authorizeAccessToScopeId, authorizeAccessToObjects } = require('../security/authorization');
const jsonApiToJson = require('../parsers/event/jsonApiToJson');
const icsToJson = require('../parsers/event/icsToJson');

// response
const returnError = require('../utils/response/returnError');
const returnSuccess = require('../utils/response/returnSuccess');
const sendNotification = require('../services/sendNotification');
const eventsToJsonApi = require('../parsers/event/eventsToJsonApi');
const eventsToIcsInJsonApi = require('../parsers/event/eventsToIcsInJsonApi');

// content
const getEvents = require('../services/events/getEvents');
const storeEvents = require('../services/events/storeEvents');
const deleteEvents = require('../services/events/deleteEvents');
const modifyEvents = require('../services/events/modifyEvents');

/* routes */

router.get('/events', authenticateFromHeaderField, function (req, res) {
    const filter = {
        scopeId: req.query['scope-id'],
        eventId: req.query['event-id'],
        from: req.query['from'],
        until: req.query['until'],
        all: req.query['all']
    };
    const user = req.user;
    const token = req.get('Authorization');

    authorizeAccessToScopeId(user, filter.scopeId)
        .then(() => getEvents(filter, token))
        .then((events) => authorizeAccessToObjects(user, 'can-read', events))
        .then(eventsToJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
});

router.post('/events', jsonApiToJson, authenticateFromHeaderField, function (req, res) {
    handleInsert(req, res, eventsToJsonApi);
});

router.post('/events/ics', icsToJson, authenticateFromHeaderField, function (req, res) {
    handleInsert(req, res, eventsToIcsInJsonApi);
});

function handleInsert(req, res, outputFormatter) {
    const user = req.user;
    const events = req.events;

    authorizeAccessToObjects(user, 'can-write', events)
        .then((events) => insertEvents(events, user))
        .then(sendInsertNotification)
        .then(outputFormatter)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
}

function insertEvents(events, user) {
    return new Promise(function (resolve, reject) {
        storeEvents(events, user)
            .then(resolve)
            .catch(reject);
    });
}

function sendInsertNotification(insertedEvents) {
    insertedEvents.forEach((insertedEvent) => {
        const {scope_id, summary, dtstart, dtend} = insertedEvent;
        sendNotification.forNewEvent(scope_id, summary, dtstart, dtend);
    });
    return insertedEvents;
}

router.put('/events/:eventId', jsonApiToJson, authenticateFromHeaderField, function (req, res) {
    handleUpdate(req, res, eventsToJsonApi);
});

router.put('/events/ics/:eventId', icsToJson, authenticateFromHeaderField, function(req, res) {
    handleUpdate(req, res, eventsToIcsInJsonApi);
});

function handleUpdate(req, res, outputFormatter) {
    const eventId = req.params.eventId;
    const event = req.events[0];
    const scopeIds = event.scope_ids;
    const user = req.user;
    const token = req.get('Authorization');

    authorizeWithPotentialScopeIds(eventId, scopeIds, user, token)
        .then(() => updateEvents(event, eventId))
        .then(sendUpdateNotification)
        .then(outputFormatter)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
}

function updateEvents(event, eventId) {
    return new Promise(function (resolve, reject) {
        modifyEvents(event, eventId)
            .then((updatedEvents) => {
                if (updatedEvents.length === 0) {
                    const error = new Error('Given eventId or scopeIds not found '
						+ 'for event modification');
                    error.status = 404;
                    error.title = 'Query Error';
                    reject(error);
                } else {
                    resolve(updatedEvents);
                }
            })
            .catch(reject);
    });
}

function sendUpdateNotification(updatedEvents) {
    updatedEvents.forEach((updatedEvent) => {
        const { scope_id, summary, dtstart, dtend } = updatedEvent;
        sendNotification.forModifiedEvent(scope_id, summary, dtstart, dtend);
    });
    return updatedEvents;
}

router.delete('/events/:eventId', authenticateFromHeaderField, function (req, res) {
    const eventId = req.params.eventId;
    // TODO somehow parse in beforehand to get the scopeIds in a nicer way
    const scopeIds = req.body.data[0].relationships['scope-ids'];
    const user = req.user;
    const token = req.get('Authorization');

    authorizeWithPotentialScopeIds(eventId, scopeIds, user, token)
        .then(() => deleteEvents(eventId, scopeIds))
        .then((deletedEvents) => {
            if (deletedEvents.length > 0) {
                returnSuccess(res, 204);
                deletedEvents.forEach((deletedEvent) => {
                    sendNotification.forDeletedEvent(
                        deletedEvent['scope_id'],
                        deletedEvent['summary'],
                        deletedEvent['dtstart'],
                        deletedEvent['dtend']
                    );
                });
            } else {
                const message = 'Given eventId or scopeIds not found '
                    + 'for event deletion';
                const status = 404;
                const title = 'Query Error';
                returnError(res, message, status, title);
            }
        })
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
});

// authorization for DELETE and UPDATE
function authorizeWithPotentialScopeIds(eventId, scopeIds, user, token) {
    return new Promise((resolve, reject) => {
        if (scopeIds && scopeIds.length > 0) {
            Promise.all(scopeIds.map((scopeId) =>
                authorizeAccessToScopeId(user, scopeId))
            ).then(resolve).catch(reject);
        } else {
            const filter = { eventId: eventId };
            getEvents(filter, token)
                .then((existingEvents) =>
                    authorizeAccessToObjects(user, 'can-write', existingEvents)
                )
                .then(resolve)
                .catch(reject);
        }
    });
}

module.exports = router;
