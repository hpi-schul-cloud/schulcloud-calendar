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
const { authorizeAccessToScopeId, authorizeAccessToObject } = require('../security/authorization');
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
        .then((events) => authorizeAccessToObject(user, 'can-read', events))
        .then(eventsToJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
});

router.post('/events', jsonApiToJson, authenticateFromHeaderField, function (req, res) {
    const user = req.user;
    const events = req.events;

    authorizeAccessToObject(user, 'can-write', events)
        .then((events) => insertEvents(events, user))
        .then(sendInsertNotification)
        .then(eventsToJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
});

router.post('/events/ics', icsToJson, authenticateFromHeaderField, function (req, res) {
    const user = req.user;
    const events = req.events;

    authorizeAccessToObject(user, 'can-write', events)
        .then((events) => insertEvents(events, user))
        .then(sendInsertNotification)
        .then(eventsToIcsInJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
});

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
    const eventId = req.params.eventId;
	const event = req.events[0];
    const filter = { eventId: eventId, all: true };
    const user = req.user;
    const token = req.get('Authorization');

    getEvents(filter, token)
        .then((existingEvent) => authorizeAccessToObject(user, 'can-read', existingEvent))
        .then((existingEvent) => authorizeAccessToObject(user, 'can-write', existingEvent))
        .then(() => authorizeAccessToObject(user, 'can-write', event))
        .then((event) => updateEvents(event, eventId))
        .then(sendUpdateNotification)
        .then(eventsToJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
});

router.put('/events/ics/:eventId', icsToJson, authenticateFromHeaderField, function(req, res) {
    const event = req.events[0];
    const eventId = req.params.eventId;
    const filter = { eventId: eventId, all: true };
    const user = req.user;
    const token = req.get('Authorization');

    getEvents(filter, token)
        .then((existingEvent) => authorizeAccessToObject(user, 'can-read', existingEvent))
        .then((existingEvent) => authorizeAccessToObject(user, 'can-write', existingEvent))
        .then(() => authorizeAccessToObject(user, 'can-write', event))
        .then((event) => updateEvents(event, eventId))
        .then(sendUpdateNotification)
        .then(eventsToIcsInJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
});

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
    const separateUsers = req.body.data[0].relationships['separate-users'];
	const scopeIds = req.body.scope_ids;
    const filter = { eventId: eventId, all: true };
    const user = req.user;
    const token = req.get('Authorization');

    getEvents(filter, token)
        .then((existingEvent) => authorizeAccessToObject(user, 'can-write', existingEvent))
        .then(() => deleteEvents(eventId, scopeIds, separateUsers))
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

module.exports = router;
