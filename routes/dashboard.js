var User = require('../models/User');
var Auction = require('../models/Auction');
var Bid = require('../models/Bid');
var userController = require('../controllers/UserController');
var auctionController = require('../controllers/AuctionController');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var app = express();

/* GET dashboard info page. */
router.get('/', function (req, res, next) {
    console.log('Dashboard Loaded');
});


router.post('/login', function (req, res) {
    userController.authorize(req, res);
});

module.exports = router;
