import puppeteer from 'puppeteer';
(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const url = 'https://www.shopcider.com/search/results?q=%ED%82%A4%EB%A7%81&key_word_type=Normal&listSource=product_list-3358;search_word;0';
    const result = await extract(url, page);
    console.log(JSON.stringify(result));
    console.log(`아이템 수 ${result.length}`);
})();
async function getItems(page) {
    return await page.$$eval('.product-list-item-box', async (listItem) => {
        return listItem.map(item => ({
            name: item.querySelector('span.product-item-name').textContent.trim(),
            price: item
                .querySelector('div.product-item-main-price ')
                .textContent.trim(),
        }));
    });
}
async function extract(url, page) {
    const result = [];
    await page.goto(url);
    let lastHeight = await page.evaluate('document.body.scrollHeight');
    while (true) {
        await sleep(1000);
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await sleep(2000);
        let newHeight = await page.evaluate('document.body.scrollHeight');
        const itemNum = await page.$$eval('.product-list-item-box', data => data.length);
        if (newHeight == lastHeight || itemNum >= 100) {
            break;
        }
        lastHeight = newHeight;
    }
    const items = await getItems(page);
    result.push(...items);
    return result.slice(0, 100);
}
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//# sourceMappingURL=index.js.map