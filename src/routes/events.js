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
const selectEvents = require('../queries/selectEvents');
const handleSuccess = require('./utils/handleSuccess');
const handleError = require('./utils/handleError');

router.options('/:eventId', cors(corsOptions));

const THREE_WEEKS = 1000 * 60 * 60 * 24 * 21;
const FROM = new Date(new Date().getTime() - THREE_WEEKS);
const UNTIL = new Date(new Date().getTime() + THREE_WEEKS);

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
router.post('/', authorize, function (req, res) {
    // TODO: implement
    handleError(res);

    //TODO: only, if created successful
    const scopeIds = req.body.scopeIds;
    const title = "Neuer Termin erstellt";
    const body = "Es wurde ein neuer Termin für Sie erstellt!";
    const token = "";   //TODO
    newNotificationForScopeIds(title, body, token, scopeIds);
});

// PUT /events/:eventId
router.put('/:eventId', authorize, function (req, res) {
    // TODO: implement
    handleError(res);

    //TODO: only, if modified successful
    const scopeIds = req.body.scopeIds;
    const title = "Ein Termin wurde verändert";
    const body = "Einer Ihrer Termine wurde verändert!";
    const token = "";   //TODO
    newNotificationForScopeIds(title, body, token, scopeIds);
});

function handleGetEvents(req, res) {
    const scopeId = req.get('scope-id');
    const eventId = req.get('event-id');
    const from = req.get('from') || FROM;
    const until = req.get('until') || UNTIL;
    const all = req.get('all');

    if (!scopeId && !eventId) {
        // TODO get all scope Ids & all events for these
    } else {
        // TODO implement success
        const filter = { scopeId, eventId, from, until, all };
        selectEvents(filter)
            .then(handleSuccess)
            .catch((error) => { handleError(error) })
    }
}

module.exports = router;
