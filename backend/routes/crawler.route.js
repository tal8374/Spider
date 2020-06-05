var express = require('express');
var router = express.Router();
var crawlerController = require('../controllers/crawler.controller');

router
    .post('/', crawlerController.crawlSite)
    .get('/', crawlerController.getSite)


module.exports = router;
