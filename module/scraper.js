var cheerio = require('cheerio');

function scraper(html) {
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
// 特殊
// 於hr~ form底下的日期
    var mainPostTimeArray = $('hr~ form').clone().children().remove().end().text().match(/(\d{2}\/\d{2}\/\d{2}\(.\)\d{2}:\d{2}:\d{2})/);

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
            title: section.children('font[color=#cc1105]').find('b').html(),
            name: section.children('font[color=#117743]').find('b').html(),
            time: mainPostTimeArray[i],
            thumb: section.find('a[target=_blank] > img').attr('src'),
            image: section.children('a:has(img)').attr('href'),
            responseCounts: section.children('font[color=#707070]').html(),
            response: []
        };

        section.children('table').each(function (i, ele) {
            var table = $(this);
            article.response.push(
                {
                    serial: table.find('input:checkbox').attr('name'),
                    text: table.find('blockquote').html(),
                    title: table.find('font[color=#cc1105]').find('b').html(),
                    name: table.find('font[color=#117743]').find('b').html(),
                    time: table.text().match(/(\d{2}\/\d{2}\/\d{2}\(.\)\d{2}:\d{2}:\d{2})/)[1],
                    thumb: table.find('img').attr('src'),
                    image: table.find('a:has(img)').attr('href')
                }
            );
        });
        pack.push(article);
    });
    return pack;
}

module.exports = scraper;