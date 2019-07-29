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
var server = require('http').createServer(app);
var io = require('socket.io')(server);

server.listen(4000);

io.on("connect", socket => {
    console.log("NEW CONNECTION: ");


    socket.on('getBids', auctionId => {
        Auction.findById(auctionId, function (err, auction) {
            if (err) {
                console.log(err);
            }
            if (auction) {
                socket.join(auctionId);
                socket.emit('bidPlaced', auction);
            }
        });
    });

    socket.on("placeBid", bidData => {
        Bid.create({
            ownerId: bidData.ownerId,
            auctionId: bidData.auctionId,
            numShares: bidData.numShares,
            pps: bidData.pps,
            date: Date.now()
        }, function (err, bid) {
            if (err) {
                console.log(err);
                console.log("Error creating Bid");
            }
            if (bid) {
                Auction.findOneAndUpdate({_id: bidData.auctionId}, {
                    $push: {
                        'graphDataSets.0.data': {
                            x: bidData.pps,
                            y: bidData.numShares
                        }, 'bids': bid
                    }, $inc: {currentBids: 1},
                }, {new: true}, function (err, auction) {
                    if (err) {
                        console.log("Error Finding Auction - Placing Bid");
                    }
                    if (auction) {
                        socket.join(auction.id);
                        auction.currentStrikePrice = this.getStrikePrice(auction);
                        auction.reserveMet = auction.currentStrikePrice >= auction.reservePrice;
                        console.log("\n**************************");
                        console.log("Volume Data - Initial: ", auction.volumeData);
                        const vol = auction.volumeData.find(function(v) {
                           return v.pps === bid.pps;
                        });
                        if(vol != null){
                            console.log("Found Existing Volume Data: ", vol);
                            console.log("Count Before: " , vol.bidCount);
                            vol.bidCount++;
                            console.log("Count After: " , vol.bidCount);
                            console.log("Updated Value: ", auction.volumeData);
                        }else{
                            console.log("No Existing Volume Data For PPS: ", bid.pps);
                            auction.volumeData.push({'pps': bid.pps, 'bidCount': 1});
                        }
                        auction.save(function(err) {
                            if(err){
                                console.log("Error Saving Auction");
                            }else{
                                console.log("Successfully Saved Auction\n\n\n");
                                socket.emit('bidPlaced', auction);
                            }
                        })
                    }
                });
            }
        });
    });

    socket.on('close', auctionId => {
        socket.leave(auctionId);
        console.log("Closed Connection");
    })
});

router.get('/', function (req, res, next) {
    auctionController.getAuctions(req, res);
});

// Find Auction
router.get('/:id', function (req, res) {
    Auction.findOne({_id: req.params.id}).exec(function (err, auction) {
        if (err) {
            console.log("Error fetching Auction");
        } else {
            res.json(auction);
        }
    });
});
// router.post('/:id', auctionController.placeBid);
router.post('/:id/clear', auctionController.emptyBids);

getStrikePrice = function (auction) {
    if (auction.bids.length === 0) {
        return 0;
    }
    let b = auction.bids;
    var bids = auction.bids.slice().sort(function (a, b) {
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
        return bids[i].pps;
    }
};

module.exports = router;