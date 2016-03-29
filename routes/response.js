var express = require('express');
var router = express.Router();

var request = require('request');
var cheerio = require('cheerio');
var xray = require('x-ray')();


/* GET users listing. */
router.get('/:serial', function(req, res, next) {

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

  request( target , function(error, response, html) {

    if (!error && response.statusCode == 200) {

      /**
       * 分割HTML
       * */

      var $ = cheerio.load(html);

      // 本文
      var mainContent = $('hr~ form > hr');

      // 自本文分割每篇文章(section)
      var sectionArray = [];
      mainContent.each( function(i, ele) {
        var $div = $('<section>');

        // reverse section from prevUntil
        $(this).prevUntil('hr').each(function (i, ele) {
          $div.prepend(ele);
        });

        sectionArray.push($div);
      });

      /**
       * X-ray scan and output 各區塊獨立取出資料
       * */

      xray(
          sectionArray.toString(),
          'section',
          [{
            serial: 'section > input:checkbox@name',
            text: 'section > blockquote',
            thumb: 'section > a[target="_blank"] img@src',
            image: 'section > a:has(img)@href',
            response:
                xray(
                    'section table',
                    [{
                      serial: 'input:checkbox@name',
                      text:'blockquote',
                      thumb:'img@src',
                      image:'a:has(img)@href'
                    }])
          }]
      )(function(err, section){
        if(err) throw err;
        res.json(section);
      });
    }
  });

});

module.exports = router;
