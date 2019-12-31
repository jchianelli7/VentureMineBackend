var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var auctionRouter = require('./routes/auctions');
var adminRouter = require('./routes/admin');
var dashboardRouter = require('./routes/dashboard');

var app = express();
var database = require('./db');
var originsWhitelist = [
    'http://localhost:4200'
];

const http = require('http').Server(app);
const io = require('socket.io')(http);
app.set('io', io);

var corsOptions = {
    origin: function (origin, callback) {
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
    },
    credentials: true
};
//here is the magic
app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auctions', auctionRouter);
app.use('/admin', adminRouter);
app.use('/dashboard', dashboardRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
