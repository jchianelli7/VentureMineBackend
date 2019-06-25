var mongoose = require('mongoose');
var User = require('../models/User');
var Auction = require('../models/Auction');
var request = require('request');

exports.getUsers = function(req, res){
    User.find((function (err, users) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }
        if (users) {
            res.json(users);
        }
    }));
};

exports.authorize = function(req, res){
    User.findOne({'username': req.body.username, 'password': req.body.password }, function(err, user){
        if(err){
            console.log("Error: " + err);
        }
        if(user){
            res.json(user);
        }else{
            res.status(400);
            res.json('Authorization Error - No Valid User Found');
        }
    });
};