var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var User = require('../models/User');
var Auction = require('../models/Auction');
var userController = require('../controllers/UserController');
var auctionController = require('../controllers/AuctionController');


router.get('/', function(req, res, next){
    auctionController.getAuctions(req, res);
    console.log("Aucti0ons");
});

router.get('/:id', function(req, res){
   auctionController.getAuction(req, res);
});

router.post('/:id', function(req, res){
   auctionController.addBid(req, res);
});

module.exports = router;