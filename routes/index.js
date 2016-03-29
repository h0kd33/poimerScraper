var express = require('express');
var router = express.Router();

var request = require('request');
var cheerio = require('cheerio');
var xray = require('x-ray')();
var superagent = require('../module/superagent-driver');
//var xray = x().driver(superagent('utf8'));
//var iconv = require('iconv-lite');


/* GET home page. */
router.get('/', function (req, res, next) {
    console.log('Request page: ' + req.query.page);
    var targetHost = 'http://homu.komica.org/00/';
    var targetUrl = req.query.page === 1 || req.query.page === undefined ? targetHost + 'index.htm' : targetHost + req.query.page + '.htm';
    console.log(targetUrl);
    request(targetUrl, function (error, response, html) {

        if (!error && response.statusCode == 200) {

            /**
             * 分割HTML
             * */

            var $ = cheerio.load(html, {
                normalizeWhitespace: false,
                xmlMode: false,
                decodeEntities: false
            });

            // 本文
            var mainContent = $('form hr');

            // 自本文分割每篇文章(section)
            var sectionArray = [];
            mainContent.each(function (i, ele) {
                var $div = $('<section>');

                // reverse section from prevUntil
                $(this).prevUntil('hr').each(function (i, ele) {
                    $div.prepend(ele);
                });

                sectionArray.push($div);
            });
            $.root().empty().append(sectionArray);



            /**
             * 各區塊獨立取出資料
             * */

            /**
             * TODO
             * - 未解決 JSON UTF-8 編碼問提
             * - 未爬 [ 日期，標題，名稱 ]
             * */


            var pack = [];
            $('section').each(function (i, ele) {
                var section = $(this);
                var article = {
                    serial: section.children('input:checkbox').attr('name'),
                    text: section.children('blockquote').html(),
                    thumb: section.find('a[target=_blank] > img').attr('src'),
                    image: section.children('a:has(img)').attr('href'),
                    responseCounts: section.children('font[color=#707070]').html(),
                    response: []
                };

                section.children('table').each(function( i, ele) {
                    var table = $(this);
                    article.response.push(
                        {
                            serial: table.find('input:checkbox').attr('name'),
                            text: table.find('blockquote').html(),
                            thumb: table.find('img').attr('src'),
                            image: table.find('a:has(img)').attr('href')
                        }
                    );
                });
                pack.push(article);
            });

            res.header("Content-Type", "application/json; charset=utf-8");
            res.json(pack);

            // render html
            //res.send( $.html() );
        }
    });
});

module.exports = router;
