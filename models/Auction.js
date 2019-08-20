var mongoose = require('mongoose');
var Bid = require('./Bid');
var BidSchema = mongoose.model('Bid').schema;


var AuctionSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true, default: ''},
    auctionStart: {type: String, required: true},
    auctionEnd: {type: String, required: true},
    sharesOffered: {type: Number, required: true},
    currentStrikePrice: {type: Number, required: true, default: 0},     //TODO: Rename
    currentPricePerShare: {type: Number, required: true, default: 0},   //TODO: Rename (livePPS/currentPPS)
    currentBids: {type: Number, required: true, default: 0},            //TODO: Remove
    showReserve: {type: Boolean, required: true, default: true},
    reservePrice: {type: Number, required: true, default: 10},
    reserveMet: {type: Boolean, required: true},
    uniqueBidders: {type: Number, required: true, default: 0},
    bids: {type: [BidSchema], required: true, default: []},
    time : { type : Date, default: Date.now },
    currentCommittedCapital: {type: Number, required: false, default: 0},
    volumeData: {type: [{}], default: [{}], required: true}
});

module.exports = mongoose.model('Auction', AuctionSchema, 'Auctions');