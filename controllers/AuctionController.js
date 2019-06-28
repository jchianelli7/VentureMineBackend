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

exports.placeBid = function (req, res) {
    // console.log("***********");
    Bid.create({
        ownerId: req.body.userId,
        auctionId: req.params.id,
        numShares: req.body.numShares,
        pps: req.body.pps
    }, function (err, bid) {
        if (err) {
            console.log(err);
        }
        if (bid) {
            // console.log("Created New Bid: ");
            // console.log(bid);
            Auction.findOneAndUpdate({_id: req.params.id}, {
                $push: {
                    'graphDataSets.0.data': {
                        x: req.body.pps,
                        y: req.body.numShares
                    }, 'bids': bid
                }, $inc: {currentBids: 1},
                $set: {currentStrikePrice: module.exports.getStrikePrice(req.params.id)}
            }, {new: true}, function (err, auction) {
                if (err) {
                    console.log(err);
                } else {
                    if (auction) {
                        console.log(auction.currentStrikePrice);
                        res.json(auction);
                    }
                }
            });
        }
    });

};

exports.getStrikePrice = function (auctionId) {
    var strikePrice = 0;
     Auction.findOne({_id: auctionId}).exec(function (err, auc) {
        if (err) {
            console.log("Error finding Auction - In getStrikePrice");
        }
        if (auc) {
           strikePrice = 10;
        }
    });

     console.log(strikePrice);
    return strikePrice;
};

