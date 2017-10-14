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

            // Build Json Object
			
            var promises = [];
			var article = [];
            var $threadpost = section.find('.post.threadpost');

            var firstPost = {
                serialNumber: $threadpost.find('.qlink').attr('data-no'),
                content: $threadpost.find('.quote').text(),
                title: $threadpost.find('.title').text(),
                userId: $threadpost.find('.now').text().match(regex.id)[0].slice(3),
                postTime: $threadpost.find('.now').text().match(regex.time)[0],
                imgThumbnailUrl: $threadpost.find('.file-thumb img').attr('src'),
                imgUrl: $threadpost.find('.file-thumb').attr('href'),
                response: []
            };
			article.push(firstPost);

            if (firstPost.imgThumbnailUrl) {
				firstPost.imgThumbnailUrl = "http:" + firstPost.imgThumbnailUrl;
                promises.push(sizeOfPromise(firstPost));
            }

            section.find('.post.reply').each(function (i, ele) {
                var $post = $(this);
                var post = {
                    serialNumber: $post.find('.qlink').attr('data-no'),
                    content: $post.find('.quote').text(),
                    userId: $post.find('.now').text().match(regex.id)[0].slice(3),
                    postTime: $post.find('.now').text().match(regex.time)[0],
                    imgThumbnailUrl: $post.find('.file-thumb img').attr('src'),
                    imgUrl: $post.find('.file-thumb').attr('href')
                };
                article.push(post);
				
                if (post.imgThumbnailUrl) {
					post.imgThumbnailUrl = "http:" + post.imgThumbnailUrl;
                    promises.push(sizeOfPromise(post));
                }
            });
			
			// 確認文章長度
            article[0]['postLength'] = article.length;
			
            pack.push(article);
            return Promise.all(promises).then(() => {
                return resolve();
            });

            function sizeOfPromise(post) {
                return new Promise(function (resolve, reject) {
                    sizeOf( {uri: post.imgThumbnailUrl}, function(err, dimensions, length) {
                        if (err) return reject(err);
                        post.imgThumbnailHeight = dimensions.height;
                        post.imgThumbnailWidth = dimensions.width;
                        post.mediaType = dimensions.type;
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
