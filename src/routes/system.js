// Project Configuration
const config = require('../config');

// Imports
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const cors = require('cors');

// Configuration
let corsOptions = {
    origin: config.CORS_ORIGIN
};
router.use(cors(corsOptions));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// Routes

router.get('/system-info/haproxy', function (req, res) {
    res.send({'timestamp': new Date().getTime()});
});

router.get('/ping', function (req, res) {
    res.send({'message': 'pong', 'timestamp': new Date().getTime()});
});

module.exports = router;
