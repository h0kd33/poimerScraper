/**
*
* 整理出　Komica 綜合版中　針對較怪異的html內容的選擇方法
*
*/

/**
 * Main Post
 */


/* 獨立出首PO日期資訊段落 (直接在form底下沒有Node的文字) */
// Example: 16/03/23(三)21:14:58 ID:HcYCwiUY No.7594711

const $mainPostInfo =

    $("hr~ form")
    .clone() //clone the element
    .children() //select all the children
    .remove() //remove all the children
    .end() //again go back to selected element
    .text();

/**
 * Response Post
 */


/**
* Others
**/

/* Navigation (排除首頁) */
// 最前頁	[0] [1] [2] [3] [4] [5] [6] [7] [8] [9] [以下省略]
const $footerNav = $('td > a[href$=htm]:not([href*=index])@href');
