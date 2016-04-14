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

    /**
     *  特殊
     *  於hr~ form > * 的日期與ID是沒有 element 的 textnode
     *  所以不會被 .children() 或 .prevUntil() 抓到
     *  */

    // body > 的主文章純文字資訊
    var textNodePart = $('body').clone().find('table').remove().end().text().match(/(\d{2}\/\d{2}\/\d{2}\(.\)\d{2}:\d{2}:\d{2}.*No\.\d+)/g);

    var regex = {
        time: /(\d{2}\/\d{2}\/\d{2}\(.\)\d{2}:\d{2}:\d{2})/,
        id: /ID:([A-z\w\d\/\^\.]*\S)/g
    };
    var mainPostTimeArray = textNodePart.toString().match(regex.time);
    var mainPostIDArray =  textNodePart.toString().match(regex.id);

    /**
     *  本文
     * */
    var mainContent = $('br[clear=left]+ hr');

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
     * */


    var pack = [];
    $('section').each(function (i, ele) {
        var section = $(this);
        var article = {
            serial: section.children('input:checkbox').attr('name'),
            text: section.children('blockquote').html(),
            title: section.children('font[color=#cc1105]').find('b').html(),
            name: section.children('font[color=#117743]').find('b').html(),
            id: mainPostIDArray[i].replace('ID:',''),
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
                    id: table.text().match(regex.id)[0].replace('ID:',''),
                    time: table.text().match(regex.time)[0],
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
