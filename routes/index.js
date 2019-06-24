var express = require('express');
var router = express.Router();
const db = require('./db');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("At Home");
  res.render('index', { title: 'Express' });
});


module.exports = router;
