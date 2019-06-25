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
}