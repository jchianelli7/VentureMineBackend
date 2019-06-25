var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var User = require('../models/User');
var Auction = require('../models/Auction');

/* GET users listing. */
router.get('/', function(req, res, next) {
  Auction.find((function (err, users){
    if(err){
      console.log('Error: ' + err);
    }
    console.log(users);
  }));
  res.send('respond with a resource');
});

module.exports = router;
