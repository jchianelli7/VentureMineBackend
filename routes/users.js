var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var User = require('../models/User');
var Bid = require('../models/Bid');
var Auction = require('../models/Auction');
var userController = require('../controllers/UserController');

/* GET users listing. */
router.get('/', function (req, res, next) {
    userController.getUsers(req, res);
});

// Get User By Id
router.get('/:id', function (req, res){
   User.findOne({_id: req.params.id}, function(err, user){
       if(err){
           console.log("Error fetching user: " + req.params.userId);
           console.log(err);
       }
       if(user){
           res.json(user);
       }
   })
});

router.get('/:id/bids/all', function (req, res) {
   Bid.find({userId: req.params.id}, function (err, bids){
       if(err){
           console.log("error finding bids for user: " + req.params.id);
           console.log(err);
       }
       if(bids){
           console.log(req.params.id);
           console.log("^ that one");
           res.json(bids);
       }
   })
});

router.get('/:id/active', function(req, res){
   let active = [];
   console.log("Hello");
   Bid.find({userId: req.params.userId}, function(err, bids){
       if(bids){
           bids.forEach(function(bid){
              if(bid.userId === req.userId){
                  active.push(bid);
              }
           });
       }
   });
   res.json(active);
});

// Get active user bids (bids on auctions still live)
// router.get('/:id/bids', function(req, res, next){
//     userController.getUserActiveBids(req, res);
//     User.findOne({_id: req.params.userId}, )
// });

module.exports = router;
