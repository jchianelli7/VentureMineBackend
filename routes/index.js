var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const db = require('../db');

/* GET home page. */
router.get('/', function(req, res, next) {
  db.get().collection('Users').find({}).toArray().then((users => {
    console.log('Users', users);
  }));
  res.render('index', { title: 'Express' });
});


module.exports = router;
