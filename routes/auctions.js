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

io.on("connect", socket => {
    let previousId;
    // const safeJoin = currentId => {
    //     socket.leave(previousId);
    //     socket.join(currentId);
    //     console.log("PREVIOUS: "  + previousId);
    //     previousId = currentId;
    //     console.log("CURRENT: " + currentId);
    //     console.log("New Connection!");
    // };

    socket.on('auctionLoaded', auctionId => {
       socket.join(auctionId);
       console.log("Auction Loaded - Joined Room");
    });

    socket.on("bidPlaced", bidData => {
        console.log("Bid Data:");
        console.log(bidData);
        Auction.findByIdAndUpdate(bidData.auctionId, {$push: {'graphDataSets.0.data' :  {x: bidData.pps, y: bidData.numShares}, },  $inc: {currentStrikePrice: 1}}, {new: true}, function(err, auction){
            if(err){
                console.log(err);
            } else{
                console.log("Bid added");
                // console.log(auction);
                if (auction) {
                    console.log("**********");
                    console.log(auction.id);
                    // safeJoin(auction.id);
                    io.in(auction.id).emit("auction", auction);
                    // socket.emit("auction", newAuction);

                    //TODO: READ*******************************
                    // https://www.thepolyglotdeveloper.com/2019/04/using-socketio-create-multiplayer-game-angular-nodejs/
                }
            }
        });

    });

    socket.on('close', auctionId => {
        socket.leave(auctionId)
    })

});


router.get('/', function (req, res, next) {
    auctionController.getAuctions(req, res);
});

// Find Auction
router.get('/:id', function (req, res) {
    // auctionController.getAuction(req.params.id);
    // console.log(req);
    Auction.findOne({_id: req.params.id}).exec(function(err, auction){
        if(err){
            console.log("Error fetching Auction");
        }else{
            res.json(auction);
        }
    });
});

// Add Bid - Shouldn't be used
router.post('/:id', function (req, res) {
    console.log("WOAHHH");
    auctionController.addBid(req, res);      // ALSo is this how I should be usuinf x=controllers and stuff?
});

module.exports = router;