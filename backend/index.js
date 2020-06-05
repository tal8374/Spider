var PORT = process.env.PORT || 3002;
var express = require('express');
var path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
var app = express();

const mongoose = require('mongoose');
const config = require('./config');

const crawlerRouter = require('./routes/crawler.route');

var http = require('http');
var server = http.Server(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, function() {
  console.log(`server is running on port ${PORT}`);
});

mongoose.connect(config.mongo_url, {}, function (err) {
    if (err) console.log(err);
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use('/crawler', crawlerRouter);

