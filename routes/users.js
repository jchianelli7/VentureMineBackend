var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var User = require('../models/User');
var Auction = require('../models/Auction');
var userController = require('../controllers/UserController');

/* GET users listing. */
router.get('/', function (req, res, next) {
    userController.getUsers(req, res);
});

module.exports = router;
