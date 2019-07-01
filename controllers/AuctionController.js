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
            Auction.findOneAndUpdate({_id: req.params.id}, {
                $push: {
                    'graphDataSets.0.data': {
                        x: req.body.pps,
                        y: req.body.numShares
                    }, 'bids': bid
                }, $inc: {currentBids: 1},
                // $set: {currentStrikePrice: module.exports.getStrikePrice(req.params.id)}
            }, {new: true}, function (err, auction) {
                if (err) {
                    console.log(err);
                } else {
                    if (auction) {
                        module.exports.getStrikePrice(req, res, auction);
                    }
                    console.log("Auction Current Strike Price - In Bid");
                    // console.log(auction.currentStrikePrice);
                    // res.json(auction);
                }
            });
        }
    });

};

exports.getStrikePrice = function (req, res, auction) {
    if(auction.bids.length === 0){
        auction.currentStrikePrice = 0;
        auction.save(function(err){
            if(err){
                console.log("Error saving default strike price value");
            }
            res.json(auction);
        })
    }
    let b = auction.bids;
    var bids = auction.bids.slice().sort(function(a, b){
        return b.pps - a.pps;
    });
    let sharesRemaining = auction.sharesOffered;
    let i = 0;
    while (sharesRemaining - bids[i].numShares > 0 && i < bids.length - 1) {
        sharesRemaining -= bids[i].numShares;
        i++;
    }
    //Sell remaining shares that escaped while loop
    if (sharesRemaining > 0) {
        console.log("Last bid (Strike Price Winner): " + JSON.stringify(bids[i]));
        // return bids[i].pps;
        auction.currentStrikePrice = bids[i].pps;
        auction.reserveMet = auction.currentStrikePrice >= auction.reservePrice;
        auction.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("**********");
                // console.log(auction);
                res.json(auction);
            }
        });
    }
};

exports.emptyBids = function (req, res) {
    Auction.findOneAndUpdate({_id: req.params.id}, {$set: {bids: [], graphDataSets:  [{ data: [] }], currentStrikePrice: 0, currentBids: 0, reserveMet: false, uniqueBidders: 0},}, {new: true}, function(err, auction){
       if(err){
           console.log(err);
       }
       if(auction){
           res.json(auction);
       }
    });
};

