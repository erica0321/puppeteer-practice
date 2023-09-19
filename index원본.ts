import puppeteer, { Page } from 'puppeteer'
import type { Item, ItemList } from './types'
;(async () => {
  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()

  const url = 'https://search.29cm.co.kr/?keyword=%EC%9A%B0%EC%82%B0'
  const itemList = await extract(url, page)

  console.log(itemList)

  await browser.close()
})()

//한페이지내 item 리스트 반환
async function getItems(page: Page): Promise<ItemList> {
  const items = []
  const pageItemNum = await page.$$eval(
    '.productContent_list ',
    data => data.length
  )

  // for (let itemNo = 2; itemNo <= pageItemNum; itemNo++) {
  const root = `div.productContent_list > ruler-list-item:nth-child(2)`

  const brandName = await page.$eval(
    `root a.info_brand`,
    data => data.innerText
  )

  const itemName = await page.$eval(
    `root a.info_desc > strong`,
    data => data.innerText
  )

  const price = await page.$eval(`root span.num`, data => data.innerText)

  const item: Item = { brandName, itemName, price }
  console.log(item)
  items.push(item)
  // }
  return items
}

async function extract(url: string, page: Page): Promise<ItemList> {
  const result: ItemList = []

  for (let pageNo = 1; pageNo <= 3; pageNo++) {
    await page.goto(
      `https://search.29cm.co.kr/?keyword=%EC%9A%B0%EC%82%B0&page=${pageNo}`
    )
    const items = await getItems(page)
    result.push(...items)
  }

  return result
}

// const itemList: ItemList = []
//
// const brandSelector = await page.waitForSelector('a.info_brand')
// const brandName = await brandSelector?.evaluate(el => el.textContent.trim())
//
// const nameSelector = await page.waitForSelector('strong.info_name')
// const itemName = await nameSelector?.evaluate(el => el.textContent.trim())
//
// const priceSelector = await page.waitForSelector('span.price_sale > span.num')
// const price = await priceSelector?.evaluate(el => el.textContent.trim())
//
// const item: Item = { brandName, itemName, price }
// itemList.push(item)
//
// console.log(itemList)
