var express = require('express')
var router = express.Router()

// TODO: move logic from router to some other location...
var client = require('../models/database')

/* GET home page. */
router.get('/', function(req, res, next) {
  const query = client.query('SELECT * FROM schools;')
  const title = query.text
  res.render('index', { title, query: JSON.stringify(query) })
})

function query(requestString) {
   return new Promise(function(resolve, reject) {
       client.query(requestString).then(resolve())
   })
}

module.exports = router
