var express = require('express')
var router = express.Router()

// TODO: move logic from router to some other location...
var client = require('../models/database')

/* GET home page. */
router.get('/', function(req, res, next) {
  const query = 'SELECT * FROM schools;'
  client.query(query, function(error, result) {
    if (error) {
      res.render('index', { query: 'Error', queryResult: JSON.stringify(error) })
    }
    res.render('index', { query, queryResult: JSON.stringify(result) })
  })
})

module.exports = router
