const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

const eventQueries = require('../queries/eventQueries');

/* GET home page. */
router.get('/', function (req, res, next) {
    Promise.resolve(eventQueries.getAll())
        .then(function(result) {
            res.render('index', { result: JSON.stringify(result) });
        })
        .catch(function(error) {
            console.log("Query error");
        })
});

router.get('/system-info/haproxy', function (req, res) {
    res.send({"timestamp": new Date().getTime()});
});

router.get('/ping', function (req, res) {
    res.send({"message": "pong", "timestamp": new Date().getTime()});
});

module.exports = router;
