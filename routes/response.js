var express = require('express');
var router = express.Router();

var request = require('request');
var cheerio = require('cheerio');

var scraper = require('../module/scraper');


/* GET users listing. */
router.get('/:serial', function (req, res, next) {

    /**
     * 爬的目標連結
     * */
    // index.php?res=7604141

    /**
     * 爬爬爬
     * */
    var serial = req.params.serial;
    var host = 'http://homu.komica.org/00/';
    var target = host + 'index.php?res=' + serial;

    request(target, function (error, response, html) {

        if (!error && response.statusCode == 200) {

            var pack = scraper(html);

            res.header("Content-Type", "application/json; charset=utf-8");
            res.json(pack);
        }
    });

});

module.exports = router;
