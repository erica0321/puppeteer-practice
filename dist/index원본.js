import puppeteer from 'puppeteer';
(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const url = 'https://search.29cm.co.kr/?keyword=%EC%9A%B0%EC%82%B0';
    const itemList = await extract(url, page);
    console.log(itemList);
    await browser.close();
})();
async function getItems(page) {
    const items = [];
    const pageItemNum = await page.$$eval('.productContent_list ', data => data.length);
    const root = `div.productContent_list > ruler-list-item:nth-child(2)`;
    const brandName = await page.$eval(`root a.info_brand`, data => data.innerText);
    const itemName = await page.$eval(`root a.info_desc > strong`, data => data.innerText);
    const price = await page.$eval(`root span.num`, data => data.innerText);
    const item = { brandName, itemName, price };
    console.log(item);
    items.push(item);
    return items;
}
async function extract(url, page) {
    const result = [];
    for (let pageNo = 1; pageNo <= 3; pageNo++) {
        await page.goto(`https://search.29cm.co.kr/?keyword=%EC%9A%B0%EC%82%B0&page=${pageNo}`);
        const items = await getItems(page);
        result.push(...items);
    }
    return result;
}
//# sourceMappingURL=index%EC%9B%90%EB%B3%B8.js.map