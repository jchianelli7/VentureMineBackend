var mongoose = require('mongoose');

var AuctionSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    auctionStart: {type: String, required: true},
    auctionEnd: {type: String, required: true},
    sharesOffered: {type: Number, required: true},
    currentStrikePrice: {type: Number, required: true, default: 0},
    currentPricePerShare: {type: Number, required: true, default: 0},
    currentBids: {type: Number, required: true, default: 0},
    showReserve: {type: Boolean, required: true, default: true},
    reservePrice: {type: Number, required: true, default: 10},
    reserveMet: {type: Boolean, required: true},
    uniqueBidders: {type: Number, required: true, default: 0},
    graphDataSets: [{}]
});

module.exports = mongoose.model('Auction', AuctionSchema, 'Auctions');