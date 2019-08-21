var User = require('../models/User');
var Auction = require('../models/Auction');
var Bid = require('../models/Bid');
// var VolumeData = require('../models/VolumeData');
var userController = require('../controllers/UserController');
var auctionController = require('../controllers/AuctionController');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var app = express();
// var server = require('http').createServer(app);


router.get('/users', function (req, res) {
    console.log("Hi");
    User.find({}).then((users => {
        if(users){
            res.json(users);
        }else{
            res.status(123);
            console.log("Error fetching all users for admin");
        }
        console.log('Users', users);
    }));
});


module.exports = router;