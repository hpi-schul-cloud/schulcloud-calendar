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

router.options('/:eventId', cors(corsOptions));

// DELETE /events/:eventId
router.delete('/:eventId', function (req, res) {
    handleDeleteRequest(req, res);

    //TODO: only, if deleted successful
    const scopeIds = req.body.scopeIds;
    const title = "Termin gelöscht";
    const body = "Ein Termin wurde gelöscht!";
    const token = "";   //TODO
    newNotificationForScopeIds(title, body, token, scopeIds);
});

// GET /events/
router.get('/', function (req, res) {
    // TODO: implement
    handleError(res);
});

// POST /events/
router.post('/', function (req, res) {
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
router.put('/:eventId', function (req, res) {
    // TODO: implement
    handleError(res);

    //TODO: only, if modified successful
    const scopeIds = req.body.scopeIds;
    const title = "Ein Termin wurde verändert";
    const body = "Einer Ihrer Termine wurde verändert!";
    const token = "";   //TODO
    newNotificationForScopeIds(title, body, token, scopeIds);
});

module.exports = router;
