import puppeteer from 'puppeteer';
(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const url = 'https://search.29cm.co.kr/?keyword=%EC%9A%B0%EC%82%B0&page=1';
    const result = await extract(url, page);
    console.log(JSON.stringify(result));
    await browser.close();
})();
async function getItems(page) {
    const result = await page.evaluate(() => {
        const items = [];
        const list = document.querySelectorAll('.item_info');
        list.forEach(el => {
            const brandName = el.children[0].textContent;
            const itemName = el.children[1].children[0].innerHTML;
            const price = el.children[1].children[1].children[0].children[0].innerHTML;
            const item = { brandName, itemName, price };
            items.push(item);
        });
        return items;
    });
    return result;
}
async function extract(url, page) {
    const result = [];
    await page.goto(url);
    let pageNo = 1;
    while (true) {
        await sleep(1000);
        const items = await getItems(page);
        result.push(...items);
        const check = await page.evaluate(() => {
            return document.getElementsByClassName('pagination-next disabled').length;
        });
        if (pageNo >= 3 || check === 1) {
            return result;
        }
        await Promise.all([
            page.click('span.pagination-next > a > ruler-svg-icon-next'),
            sleep(1000)
        ]);
        pageNo += 1;
    }
}
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//# sourceMappingURL=index.js.map