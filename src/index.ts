import puppeteer, { Page } from 'puppeteer'
import type { Item, ItemList } from './types'
;(async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  const url = 'https://search.29cm.co.kr/?keyword=%EC%9A%B0%EC%82%B0&page=1'

  const result: ItemList = await extract(url, page)

  console.log(JSON.stringify(result))
  // console.log(`아이템 수 ${result.length}`)

  await browser.close()
})()

//한페이지내 item 리스트 반환
async function getItems(page: Page) {
  return await page.$$eval('.list_item', async listItem => {
    return listItem.map(item => ({
      brandName: item.querySelector('a.info_brand').textContent.trim(),
      itemName: item.querySelector('a.info_desc > strong').textContent.trim(),
      price: item.querySelector('span.num').textContent.trim(),
    }))
  })
  // console.log(`개수: ${result.length}`)
}

async function extract(url: string, page: Page) {
  const result: ItemList = []

  await page.goto(url)
  let pageNo = 1

  while (true) {
    await sleep(1000)
    const items = await getItems(page)
    result.push(...items)

    const check = await page.evaluate(() => {
      return document.getElementsByClassName('pagination-next disabled').length
    })

    if (pageNo >= 3 || check === 1) {
      return result
    }

    await Promise.all([
      page.click('span.pagination-next > a > ruler-svg-icon-next'),
      sleep(1000),
    ])
    // console.log('다음페이지')

    pageNo += 1
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
