var mongoose = require('mongoose');
var User = require('../models/User');
var Auction = require('../models/Auction');
var Bid = require('../models/Bid');
var request = require('request');

exports.getAuctions = function (req, res) {
    Auction.find((function (err, auctions) {
        if (err) {
            console.log("error: " + err);
        }
        if (auctions) {
            console.log("Got Auctions");
            res.json(auctions);
        } else {
            res.status(123);
            res.json("Error - No Auctions Retrieved");
        }
    }));
};

exports.getAuction = function (req, res) {
    Auction.findById(req.params.id).exec(function (err, auction) {
        if (auction) {
            console.log("fetched auction");
            console.log(module.exports.getStrikePrice(req.params.id));
            res.json(auction);
        } else {
            console.log("Error Fetching Auction - None found for given ID");
        }
    });
};

exports.emptyBids = function (req, res) {
    Auction.findOneAndUpdate({_id: req.params.id}, {$set: {bids: [], currentStrikePrice: 0, currentBids: 0, reserveMet: false, uniqueBidders: 0, volumeData: [], currentCommittedCapital: 0},}, {new: true}, function(err, auction){
        if(err){
            console.log(err);
        }
        if(auction){
            for(let x = 25; x <= 75; x++){
                auction.volumeData.push({pps: x, shareCount: null});
            }
            auction.save(function(err, savedAuction){
                if(err){
                    console.log("Error Saving Auction - Added Blank Defaults: ", err);
                }
                if(savedAuction){
                    res.json(savedAuction);
                }
            });
        }
    });
    try {
        Bid.deleteMany({"auctionId" : req.params.id}).then(result => console.log(`Deleted ${result.deletedCount} item(s).`));
    } catch(e){
        console.log('Error deleting Bids : ', e);
    }

};

