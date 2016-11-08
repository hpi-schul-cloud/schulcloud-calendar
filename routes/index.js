var express = require('express');
var router = express.Router();

// TODO: use client for db queries until logic is moved from router to some other location...
//var client = require('../models/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
