const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const cors = require('cors');
let corsOptions = {
    origin: 'https://schulcloud.github.io'
};
router.use(cors(corsOptions));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

const handleDeleteRequest = require("./utils/handleDeleteRequest");
const authorize = require("../authorization/index");
const getEvents = require('../services/events/getEvents');
const handleSuccess = require('./utils/handleSuccess');
const handleError = require('./utils/handleError');
const getScopesForToken = require('../services/scopes/getScopesForToken');
const jsonApiToJson = require('../parsers/jsonApiToJson');
const newNotificationForScopeIds = require('../http-requests/newNotificationForScopeIds');

const uuidV4 = require('uuid/v4');

router.options('/:eventId', cors(corsOptions));

// DELETE /events/:eventId
router.delete('/:eventId', authorize, function (req, res) {
    handleDeleteRequest(req, res);

    //TODO: only, if deleted successful
    const scopeIds = req.body.scopeIds;
    const title = "Termin gelöscht";
    const body = "Ein Termin wurde gelöscht!";
    const token = "";   //TODO
    newNotificationForScopeIds(title, body, token, scopeIds);
});

// GET /events/
router.get('/', authorize, function (req, res) {
    // TODO: implement
    handleGetEvents(req, res);
});

// POST /events/
router.post('/', authorize, jsonApiToJson, function (req, res) {

    const externalEventId = uuidV4();

    req.events.forEach(function(event) {
        // handleJson(event, event.separateUsers, event.scopeIds, externalEventId, req, res);

        //TODO: only, if created successfully
        const title = "Neuer Termin erstellt";
        const body = "Es wurde ein neuer Termin für Sie erstellt!";
        newNotificationForScopeIds(title, body, req.token, event.scopeIds);
    });
});

// PUT /events/:eventId
router.put('/:eventId', authorize, function (req, res) {
    // TODO: implement
    handleError(res);

    //TODO: only, if modified successfully
    const scopeIds = req.body.scopeIds;
    const title = "Ein Termin wurde verändert";
    const body = "Einer Ihrer Termine wurde verändert!";
    const token = "";   //TODO
    newNotificationForScopeIds(title, body, token, scopeIds);
});

function handleGetEvents(req, res) {
    const filter = {
        scopeId: req.get('scope-id'),
        eventId: req.get('event-id'),
        from: req.get('from'),
        until: req.get('until'),
        all: req.get('all')
    };

    if (filter.scopeId || filter.eventId) {
        getEvents(filter)
            .then((events) => {
                returnEvents(events);
            })
            .catch((error) => { handleError(res, error) })
    } else {
        const token = req.get('Authorization');
        getScopesForToken(token)
            .then((scopes) => { getEventsPerScope(scopes, filter) })
            .catch((error) => { handleError(res, error) })
    }

    function returnEvents(events) {
        // TODO events in JSON API format
        handleSuccess(res, events);
    }

    function getEventsPerScope(scopes, filter) {
        const { from, until, all } = filter;
        const eventsPerScope = scopes.map((scope) => {
            filter = { scopeId: scope.id, from, until, all };
            return getEvents(filter);
        });

        Promise.all(eventsPerScope)
            .then((eventsCollection) => {
                returnEvents(flatten(eventsCollection));
            })
            .catch((error) => { handleError(res, error) })
    }

    // flatten result of results and filter empty results
    function flatten(collection) {
        return collection.reduce((flattened, current) => {
            return current.length > 0
                ? [...flattened, ...current]
                : flattened;
        }, [])
    }
}

module.exports = router;
