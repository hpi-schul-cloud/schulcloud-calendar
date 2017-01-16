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

router.delete('/:eventId', function (req, res) {
    handleDeleteRequest(req, res);
});

module.exports = router;
