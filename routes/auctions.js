var User = require('../models/User');
var Auction = require('../models/Auction');
var userController = require('../controllers/UserController');
var auctionController = require('../controllers/AuctionController');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

server.listen(4000);
io.on("connection", socket => {
    let previousId;
    const safeJoin = currentId => {
        socket.leave(previousId);
        socket.join(currentId);
        previousId = currentId;
        console.log("New Connection!");
    };

    socket.on("getAuction", auctionId => {
        safeJoin(auctionId);
        console.log(auctionId);
        let auction = auctionController.getAuction(auctionId);

        socket.emit("auction", auction);
    });

    socket.on("bidPlaced", bidData => {
        console.log("Bid Data:");
        console.log(bidData);
        Auction.findOneAndUpdate({_id: bidData.auctionId}, {$push: {'graphDataSets.0.data' :  {x: bidData.pps, y: bidData.numShares}, } } , {new: true}, function(err, auction){
            if(err){
                console.log(err);
            } else{
                console.log("Bid added");
                console.log(auction);
                if (auction) {
                    console.log("auction id: ");
                    console.log(auction.id);
                    safeJoin(auction.id);
                    io.emit("auction", auction);
                    // socket.emit("auction", newAuction);
                }
                // return auction;
            }
        });
        // console.log("New Auction: ");
        // console.log(auction);

    });

});


router.get('/', function (req, res, next) {
    auctionController.getAuctions(req, res);
    console.log("Aucti0ons");
});

router.get('/:id', function (req, res) {
    // auctionController.getAuction(req.params.id);
    Auction.findById(req.params.id).exec(function(err, auction){
        if(err){
            console.log("Error fetching Auction");
        }else{
            res.json( auction);
        }
    });
});

router.post('/:id', function (req, res) {
    auctionController.addBid(req, res);      // ALSo is this how I should be usuinf x=controllers and stuff?
});

module.exports = router;