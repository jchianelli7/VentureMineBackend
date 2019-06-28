var mongoose = require('mongoose');

var BidSchema = new mongoose.Schema({
    ownerId: {type: String, required: true},
    auctionId: {type: String, required: true},
    numShares: {type: Number, required: true},
    pps: {type: Number, required: true},
    date : { type : Date, default: Date.now }
});

module.exports = mongoose.model('Bid', BidSchema, 'Bids');