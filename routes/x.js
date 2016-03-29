// 暫時棄用 x-ray 因為難以處理 utf-8 解碼
/**
 * Komica X-ray Beta
 */

var express = require('express');
var router = express.Router();

var request = require('request');
var x = require('x-ray')();
var cheerio = require('cheerio');


/* GET users listing. */
router.get('/', function (req, res, next) {
    request('http://homu.komica.org/00/index.htm', function (error, response, html) {


        if (!error && response.statusCode == 200) {

            var $ = cheerio.load(html);


            /**
             * X-ray scan and output 各區塊獨立取出資料
             * */

            var result;
            xray(
                $.html(),
                'section',
                [{
                    serial: 'section input:checkbox@name',
                    text: 'section blockquote',
                    thumb: 'section > a[target="_blank"] img@src',
                    image: 'section > a:has(img)@href',
                    responseCounts: 'section > font[color=#707070]',
                    response: xray(
                        'section table',
                        [{
                            serial: 'input:checkbox@name',
                            text: 'blockquote',
                            thumb: 'img@src',
                            image: 'a:has(img)@href'
                        }])
                }]
            )(function (err, section) {
                if (err) throw err;
                result = section;
            });
        }

    });

});

module.exports = router;

