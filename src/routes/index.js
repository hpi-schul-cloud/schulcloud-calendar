const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

const allEvents = require('../queries/allEvents');
const queryToJson = require('../parsers/queryToJson');
const handleError = require('./utils/handleError')

/* GET home page. */
router.get('/', function (req, res, next) {
    Promise.resolve(allEvents()).then(
        function(result) {
            res.render('index', {result: JSON.stringify(queryToJson(result))});
        },
        handleError.bind(null, res)
    );
});

router.get('/system-info/haproxy', function (req, res) {
    res.send({"timestamp": new Date().getTime()});
});

router.get('/ping', function (req, res) {
    res.send({"message": "pong", "timestamp": new Date().getTime()});
});

module.exports = router;
