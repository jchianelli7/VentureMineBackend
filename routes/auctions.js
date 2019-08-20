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
                    }, $inc: {currentBids: 1, currentCommittedCapital: (bid.pps * bid.numShares)},
                }, {new: true}, function (err, auction) {
                    if (err) {
                        console.log("Error Finding Auction - Placing Bid");
                    }
                    if (auction) {
                        socket.join(auction.id);
                        console.log("Joined Room: ", auction.id);
                        auction.currentStrikePrice = this.getStrikePrice(auction);
                        auction.reserveMet = auction.currentStrikePrice >= auction.reservePrice;

                        /** UPDATE VOLUME DATA FOR AUCTION **/
                        let foundData = false;
                        var auc = auction.toObject();
                        var volData = auc.volumeData.sort(function(a, b){
                            return a.pps - b.pps;
                        });
                        for(let x = 0; x < volData.length; x++){
                            if(volData[x].pps === bidData.pps){
                                volData[x].shareCount = Number(bidData.numShares) + Number(volData[x].shareCount);
                                foundData = true;
                                if(volData[x + 1] === undefined || volData[x + 1].pps !== bidData.pps + 1){
                                    volData.push({pps: bidData.pps + 1, shareCount: 0})
                                }
                                if(volData[x - 1] === undefined || volData[x-1].pps !== bidData.pps - 1) {
                                    volData.push({pps: bidData.pps - 1, shareCount: 0})
                                }
                            }
                        }
                        if(!foundData){
                            volData.push({pps: Number(bidData.pps), shareCount: Number(bidData.numShares)});
                        }
                        volData.sort(function(a, b) {
                            return a.pps - b.pps;
                        });
                        auction.volumeData = volData;
                        auction.save(function(err, savedAuction) {
                            if(err){
                                console.log("Error Saving Auction", err);
                            }else{
                                // socket.emit('bidPlaced', savedAuction);
                                io.in(bidData.auctionId).emit('bidPlaced', savedAuction);
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

updateVolumeData = function (auction, bid) {
    var foundData = false;
    var volData = auction.volumeData.toObject();
   volData.forEach(function(v) {
        console.log(v);
        if(v.pps === bid.pps){
            v.bidCount = v.bidCount + 1;
            console.log("Found & Incremented: ", volData);
            console.log(volData[volData.indexOf(v)]);
            foundData = true;
        }
    });
    if(foundData === false){
        console.log("Didn't find value, adding now");
        volData.push({pps: bid.pps, bidCount: 1});
    }else{
        console.log("found data apparently...?", foundData)
    }
    return volData;
};

module.exports = router;