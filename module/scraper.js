var cheerio = require('cheerio');
var sizeOf = require('request-image-size');

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

    // post-head-information (無題17/07/27(四)00:33:14 ID:s7p4i63sNo.9535821del[回應])
    var $contents = $('#contents');
    var phi = $contents.find('.post-head').clone();
    var regex = {
        time: /(\d{2}\/\d{2}\/\d{2}\(.\)\d{2}:\d{2}:\d{2})/g,
        id: /ID:([A-z\w\d\/\^\.]*\S)/g
    };
    var mainPostTimeArray = phi.find('.now').text().match(regex.time);
    var mainPostIDArray =  phi.find('.now').text().match(regex.id);

    /**
     * 各區塊獨立取出資料
     * */

    /**
     * TODO
     * - 未解決 JSON UTF-8 編碼問提
     * */

    var packPromises = [];
    var pack = [];
    $('.thread').each(function (i, ele) {
        packPromises.push(new Promise(function (resolve, reject) {
            var section = $(ele);
            var thumb = section.find('a[target=_blank] > img');

            // Build Json Object

            var promises = [];
            var $threadpost = section.find('.post.threadpost');
            var article = {
                serial: $threadpost.find('.qlink').attr('data-no'),
                text: $threadpost.find('.quote').text(),
                title: $threadpost.find('.title').innerText,
                id: $threadpost.find('.now').text().match(regex.id)[0],
                time: $threadpost.find('.now').text().match(regex.time)[0],
                thumb: thumb.attr('src'),
                image: thumb.parent().attr('href'),
                responseCounts: $threadpost.find(".warn_txt2").innerText,
                response: []
            };
            if (article.thumb) {
                promises.push(sizeOfPromise(article));
            }

            section.find('.post.reply').each(function (i, ele) {
                var $post = $(this);
                var post = {
                    serial: $post.find('.qlink').attr('data-no'),
                    text: $post.find('.quote').text(),
                    id: $post.find('.now').text().match(regex.id)[0],
                    time: $post.find('.now').text().match(regex.time)[0],
                    thumb: $post.find('img').attr('src'),
                    image: $post.find('img').parent().attr('href')
                };
                article.response.push(post);
                if (post.thumb) {
                    promises.push(sizeOfPromise(post));
                }
            });

            pack.push(article);
            return Promise.all(promises).then(() => {
                return resolve();
            });

            function sizeOfPromise(post) {
                return new Promise(function (resolve, reject) {
                    sizeOf( {uri: post.thumb}, function(err, dimensions, length) {
                        if (err) return reject(err);
                        post.thumbDimensions = dimensions;
                        resolve();
                    });
                });
            }
        }));
    });

    var resolver = Promise.resolve(packPromises[0]).then((r) => {
        console.log(r);
    });
    packPromises.forEach(function (promise) {
        resolver = resolver.then(promise);
    });
    console.log(pack);
    return resolver.then(function () {
        return pack;
    });
}

module.exports = scraper;
