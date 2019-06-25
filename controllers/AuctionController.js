var mongoose = require('mongoose');
var User = require('../models/User');
var Auction = require('../models/Auction');
var request = require('request');

exports.getAuctions = function (req, res) {
    Auction.find((function (err, auctions){
        if(err){
            console.log("error: " + err);
        }
        if(auctions){
            res.json(auctions);
        }else{
            res.status(123);
            res.json("Error - No Auctions Retrieved");
        }
    }));
};

exports.getAuction = function(req, res){
    Auction.findById(req.params.id).exec(function(err, auction){
        if(auction){
            res.json(auction);
        }else{
            console.log("Error Fetching Auction - None found for given ID");
        }
    });
};

exports.addBid = function(req, res){
    console.log('adfadsf: ' + req.params.id);
    Auction.findOneAndUpdate({_id: req.params.id}, {$push: {graphDataSets$0 : {data: {x: req.body.numShares, y: req.body.pps}}}}, function(err, auction){
       if(err){
           console.log(err);
       } else{
           console.log("Bid added");
           res.json(auction);
       }
    });
};