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

exports.getAuction = function(auctionId) {
    console.log(auctionId);
    Auction.findById(auctionId).exec(function(err, auction){
        if(err){
            console.log("Error fetching Auction");
        }else{
            return auction;
        }
    });
};

// exports.getAuction = function(req, res){
//     Auction.findById(req.params.id).exec(function(err, auction){
//         if(auction){
//             res.json(auction);
//         }else{
//             console.log("Error Fetching Auction - None found for given ID");
//         }
//     });
// };

function addBid (auctionId, pps, numShares){
    Auction.findOneAndUpdate({_id: auctionId}, {$push: {'graphDataSets.0.data' :  {x: pps, y: numShares}, } } , {new: true}, function(err, auction){
       if(err){
           console.log(err);
       } else{
           console.log("Bid added");
           console.log(auction.graphDataSets[0].data);
           return auction;
       }
    });
};

