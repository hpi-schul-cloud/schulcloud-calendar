const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

const queryToJson = require('../parsers/queryToJson');
const handleError = require('./utils/handleError')

/* GET home page. */
router.get('/', function (req, res, next) {
        res.render('index', {text: 'Blub!!'});
});

router.get('/system-info/haproxy', function (req, res) {
    res.send({"timestamp": new Date().getTime()});
});

router.get('/ping', function (req, res) {
    res.send({"message": "pong", "timestamp": new Date().getTime()});
});

module.exports = router;
