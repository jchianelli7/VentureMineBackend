var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const db = require('../db');
var userController = require('../controllers/UserController');
var auctionController = require('../controllers/AuctionController');

/* GET home page. */
router.get('/', function (req, res, next) {
    db.get().collection('Users').find({}).toArray().then((users => {
        console.log('Users', users);
    }));
    res.render('index', {title: 'Express'});
});

router.post('/login', function (req, res) {
    userController.authorize(req, res);
});

module.exports = router;
