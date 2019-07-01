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

    // socket.on('auctionLoaded', auctionId => {
    //    socket.join(auctionId);
    //    console.log("Auction Loaded - Joined Room");
    // });

    socket.on("bidPlaced", bidData => {
        console.log("Bid Data:");
        // console.log(bidData);
        if (io.sockets.adapter.rooms[bidData.auctionId]) {
            console.log("Already in the right room. Staying");
        } else {
            console.log("In the wrong room. Switching.");
            socket.leaveAll();
            socket.join(bidData.auctionId);
        }
        // Auction.findByIdAndUpdate(bidData.auctionId, {$push: {'graphDataSets.0.data' :  {x: bidData.pps, y: bidData.numShares}, bids: {pps: bidData.pps, numShares: bidData.numShares, auctionId: auc}},  $inc: {currentStrikePrice: 1}}, {new: true}, function(err, auction){
        //     if(err){
        //         console.log(err);
        //     } else{
        //         console.log("Bid added");
        //         // console.log(auction);
        //         if (auction) {
        //             console.log("**********");
        //             // safeJoin(auction.id);
        //             console.log(auction);
        //             console.log(">>>>>>>>>>>>>>>>");
        //             io.in(auction.id).emit('auctionUpdated', auction);
        //             // socket.emit("auction", newAuction);
        //         }
        //     }
        // });
        Auction.findOne({_id: bidData.auctionId}, function (err, auction) {
            if (err) {
                console.log("Error Finding Auction - Placing Bid");
            }
            if (auction) {
                auction.graphDataSets[0].data.push({x: bidData.numShares, y: bidData.pps});
                auction.currentBids++;


                Bid.create({
                    ownerId: bidData.ownerId,
                    auctionId: auction.id,
                    numShares: bidData.numShares,
                    pps: bidData.pps,
                    date: Date.now()
                }, function (err, bid) {
                    if (err) {
                        console.log(err);
                        console.log("Error creating Bid");
                        // console.log(bidData);
                    }
                    // console.log("CREATED BID: ");
                    // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
                    // console.log(auction);
                    // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
                    // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
                    auction.bids.push(bid);
                    auction.currentStrikePrice = this.getStrikePrice(auction);
                    auction.reserveMet = auction.currentStrikePrice >= auction.reservePrice;
                    auction.save(function (err) {
                        if (err) {
                            console.log("error saving auction after bid");
                        } else {
                            console.log("New Auction");
                            // console.log(auction);
                            io.in(auction.id).emit('auctionUpdated', auction);
                        }
                    });
                    // console.log("Strike Price: " + this.getStrikePrice(auction));

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
router.post('/:id', auctionController.placeBid);
router.post('/:id/clear', auctionController.emptyBids);


getStrikePrice = function (auction){
    // console.log("------------------------------");
    // console.log(auction);
    // console.log("------------------------------");
    if (auction.bids.length === 0) {
       return 0;

    }else{
        console.log("BIDS EXIST: ");
        console.log(auction.bids);
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
        console.log("Last bid (Strike Price Winner): " + JSON.stringify(bids[i]));
        // return bids[i].pps;
        // auction.currentStrikePrice = bids[i].pps;
        // auction.reserveMet = auction.currentStrikePrice >= auction.reservePrice;
        // auction.save(function (err) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log("**********");
        //         // console.log(auction);
        //         return auction;
        //     }
        // });
        return bids[i].pps;
    }

}
;

module.exports = router;