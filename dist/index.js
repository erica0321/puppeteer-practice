import puppeteer from 'puppeteer';
(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const url = 'https://search.29cm.co.kr/?keyword=%EC%9A%B0%EC%82%B0';
    const result = await extract(url, page);
    console.log(result);
    console.log(`아이템 수 ${result.length}`);
    await browser.close();
})();
async function getItems(page) {
    const items = [];
    const pageItemNum = await page.$$eval('.list_item ', data => data.length);
    console.log(`아이템 개수: ${pageItemNum}`);
    for (let itemNo = 1; itemNo <= pageItemNum; itemNo++) {
        const root = `div.productContent_list > ruler-list-item:nth-child(${itemNo})`;
        const brandNameSelector = await page.waitForSelector(`${root} a.info_brand`);
        const brandName = await brandNameSelector?.evaluate(data => data.textContent);
        const itemNameSelector = await page.waitForSelector(`${root} a.info_desc > strong`);
        const itemName = await itemNameSelector?.evaluate(data => data.textContent);
        const priceSelector = await page.waitForSelector(`${root} span.num`);
        const price = await priceSelector?.evaluate(data => data.textContent);
        const item = { brandName, itemName, price };
        items.push(item);
    }
    return items;
}
async function extract(url, page) {
    const result = [];
    for (let pageNo = 1; pageNo <= 3; pageNo++) {
        await page.goto(`https://search.29cm.co.kr/?keyword=%EC%9A%B0%EC%82%B0&page=${pageNo}`);
        await page.waitForTimeout(1000);
        const items = await getItems(page);
        result.push(...items);
    }
    return result;
}
//# sourceMappingURL=index.js.map