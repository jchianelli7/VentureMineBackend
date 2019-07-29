var mongoose = require('mongoose');

var VolumeSchema = new mongoose.Schema({
    auctionId: {type: String, required: true},
    pps: {type: Number, required: true},
    count : { type : Number, default: 1 }
});

module.exports = mongoose.model('VolumeData', VolumeSchema, 'VolumeDataSets');