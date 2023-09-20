import puppeteer from 'puppeteer';
(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const url = 'https://www.shopcider.com/product/list?collection_id=14&link_url=https%3A%2F%2Fwww.shopcider.com%2Fproduct%2Flist%3Fcollection_id%3D14&operationpage_title=search_result&operation_position=4-1-0&operation_type=category&operation_content=%EC%83%81%EC%9D%98&operation_image=&operation_update_time=1686838115206&listSource=search_result-%ED%82%A4%EB%A7%81%3Bcollection_14%3B4-1-0';
    const result = await extract(url, page);
    console.log(JSON.stringify(result));
    console.log(`아이템 수 ${result.length}`);
    await browser.close();
})();
async function getItems(page) {
    const items = await page.$$eval('.product-list-item-box', async (listItem) => {
        return listItem.map(item => {
            return [
                Number(item.querySelector('a.cider-link').href.match(/style_id=(\d+)/)[1]),
                {
                    name: item
                        .querySelector('span.product-item-name')
                        .textContent.trim(),
                    price: item
                        .querySelector('div.product-item-main-price ')
                        .textContent.trim(),
                },
            ];
        });
    });
    return new Map(items);
}
async function extract(url, page) {
    const mapResult = new Map();
    await page.goto(url);
    let lastHeight = await page.evaluate(() => document.body.scrollHeight);
    while (true) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForNavigation();
        let newHeight = await page.evaluate(() => document.body.scrollHeight);
        if (newHeight === lastHeight || mapResult.size >= 100) {
            break;
        }
        lastHeight = newHeight;
        const items = await getItems(page);
        for (let [key, value] of items) {
            mapResult.set(key, value);
        }
    }
    return Array.from(mapResult.values()).slice(0, 100);
}
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//# sourceMappingURL=index.js.map