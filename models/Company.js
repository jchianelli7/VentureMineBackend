var mongoose = require('mongoose');
var AuctionSchema = require('./Auction');
var UserSchema = require('./User');

var CompanySchema = new mongoose.Schema({
    companyName: {type: String, required: true},
    auctions: {type: [AuctionSchema], required: true, default: []},
    generalBio: {type: String, required: true, default: "Default Bio"},
    images: {type: [String], required: true, default: []},
    staff: {type: [{}], required: true, default: []},
    documents: {type: [String], required: true, default: []},
    owner: {type: UserSchema, required: true},
});

module.exports = mongoose.model('Company', CompanySchema, 'Companies');