var express = require('express');
var router = express.Router();

var request = require('request');
var cheerio = require('cheerio');

// user module
var scraper = require('../module/scraper');

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log('Request page: ' + req.query.page);
    var targetHost = 'http://rem.komica2.net/00/';
    var targetUrl = req.query.page === '0' || req.query.page === undefined ? targetHost + 'index.htm': targetHost + req.query.page + '.htm';

    console.log(targetUrl);
    request(targetUrl, function (error, response, html) {

        if (!error && response.statusCode == 200) {
            scraper(html).then(function (pack) {
                res.header("Content-Type", "application/json; charset=utf-8");
                res.json(pack);
            });
        }
    });
});

module.exports = router;
