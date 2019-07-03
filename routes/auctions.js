var User = require('../models/User');
var Auction = require('../models/Auction');
var Bid = require('../models/Bid');
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
        Auction.findById(auctionId, function(err, auction){
           if(err){
               console.log(err);
           } if(auction){
               console.log("Get bids");
               socket.join(auctionId);
               console.log(io.sockets.adapter.rooms);
               console.log("Joined Room: " + auctionId);
               socket.emit('bidPlaced', auction);
            }
        });
    });

    socket.on("placeBid", bidData => {
        // console.log(bidData);
        // if (io.sockets.adapter.rooms[bidData.auctionId]) {
        //     console.log("Already in the right room. Staying");
        // } else {
        //     console.log("In the wrong room. Switching.");
        //     console.log('Before: ', io.sockets.adapter.rooms);
        //     socket.leaveAll();
        //     console.log('\n\n');
        //     console.log('After: ', io.sockets.adapter.rooms);
        //     socket.join(bidData.auctionId);
        // }

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
                // console.log(bidData);
            }
            if(bid){
                Auction.findOneAndUpdate({_id: bidData.auctionId}, {$push: {'graphDataSets.0.data': {
                            x: bidData.pps,
                            y: bidData.numShares
                        }, 'bids': bid
                    }, $inc: {currentBids: 1},
                    // $set: {currentStrikePrice: module.exports.getStrikePrice(req.params.id)}
                }, {new: true}, function (err, auction) {
                    if (err) {
                        console.log("Error Finding Auction - Placing Bid");
                    }
                    if (auction) {
                        socket.join(auction.id);
                        auction.currentStrikePrice = this.getStrikePrice(auction);
                        auction.reserveMet = auction.currentStrikePrice >= auction.reservePrice;
                        auction.save(function (err) {
                            if (err) {
                                console.log("error saving auction after bid");
                                console.log(err);
                            } else {
                                console.log('\n\n\n');
                                console.log("placed Bid");
                                console.log(auction.graphDataSets[0]);
                                io.in(auction.id).emit('bidPlaced', auction);
                                // io.emit('bidPlaced', auction);
                            }
                        });
                        console.log(io.sockets.adapter.rooms);
                    }
                });

            }



            // console.log("Strike Price: " + this.getStrikePrice(auction));

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
    // auctionController.getAuction(req.params.id);
    // console.log(req);
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


getStrikePrice = function (auction){
    // console.log("------------------------------");
    // console.log(auction);
    // console.log("------------------------------");
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

}
;

module.exports = router;