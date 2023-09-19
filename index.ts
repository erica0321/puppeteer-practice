import puppeteer, { Page } from 'puppeteer'
import type { Item, ItemList } from './types'
;(async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  const url = 'https://search.29cm.co.kr/?keyword=%EC%9A%B0%EC%82%B0'

  const result: ItemList = await extract(url, page)

  console.log(result)
  console.log(`아이템 수 ${result.length}`)

  await browser.close()
})()

//한페이지내 item 리스트 반환
async function getItems(page: Page): Promise<ItemList> {
  const items = []
  const pageItemNum = await page.$$eval('.list_item ', data => data.length)

  // console.log(`아이템 개수: ${pageItemNum}`)

  for (let itemNo = 1; itemNo <= pageItemNum; itemNo++) {
    const root = `div.productContent_list > ruler-list-item:nth-child(${itemNo})`

    //브랜드 이름
    const brandNameSelector = await page.waitForSelector(`${root} a.info_brand`)
    const brandName: string = await brandNameSelector?.evaluate(
      data => data.textContent
    )

    //아이템 이름
    const itemNameSelector = await page.waitForSelector(
      `${root} a.info_desc > strong`
    )
    const itemName: string = await itemNameSelector?.evaluate(
      data => data.textContent
    )

    //가격
    const priceSelector = await page.waitForSelector(`${root} span.num`)
    const price: string = await priceSelector?.evaluate(
      data => data.textContent
    )

    const item: Item = { brandName, itemName, price }
    items.push(item)
  }
  return items
}

async function extract(url: string, page: Page): Promise<ItemList> {
  const result: ItemList = []

  for (let pageNo = 1; pageNo <= 3; pageNo++) {
    // console.log(`${pageNo}페이지`)
    await page.goto(
      `https://search.29cm.co.kr/?keyword=%EC%9A%B0%EC%82%B0&page=${pageNo}`
    )
    await page.waitForTimeout(1000)
    const items = await getItems(page)
    result.push(...items)
  }
  return result
}
