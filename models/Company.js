var mongoose = require('mongoose');
var UserSchema = require('./User');

var CompanySchema = new mongoose.Schema({
    companyName: {type: String, required: true},
    auctionIds: {type: [String], required: true, default: []},
    generalBio: {type: String, required: true, default: "Default Bio"},
    images: {type: [String], required: true, default: []},
    staff: {type: [{}], required: true, default: []},
    documents: {type: [String], required: true, default: []},
    owner: {type: UserSchema, required: true},
    activeAuctionId: {type: String, required: true, default: null}
});

module.exports = mongoose.model('Company', CompanySchema, 'Companies');