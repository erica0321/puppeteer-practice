import puppeteer, { Page } from 'puppeteer'
import type { Item, ItemList } from './types'
import { next } from 'cheerio/lib/api/traversing'
;(async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  const url = 'https://search.29cm.co.kr/?keyword=%EC%9A%B0%EC%82%B0&page=1'

  const result: ItemList = await extract(url, page)

  console.log(result)
  console.log(`아이템 수 ${result.length}`)

  await browser.close()
})()

//한페이지내 item 리스트 반환
async function getItems(page: Page): Promise<ItemList> {
  const result: Item[] = await page.evaluate(() => {
    const items: Item[] = []
    const list = document.querySelectorAll('.item_info')

    list.forEach(el => {
      const brandName = el.children[0].innerHTML
      const itemName = el.children[1].children[0].innerHTML
      const price = el.children[1].children[1].children[0].children[0].innerHTML

      const item: Item = { brandName, itemName, price }
      items.push(item)
    })
    return items
  })

  console.log(`개수: ${result.length}`)
  return result
}

async function extract(url: string, page: Page): Promise<ItemList> {
  const finalresult: ItemList = []

  await page.goto(url)
  let pageNo = 1

  while (true) {
    const items = await getItems(page)
    finalresult.push(...items)

    const check = await page.evaluate(() => {
      return document.getElementsByClassName('pagination-next disabled').length
    })

    // console.log(check)
    if (pageNo > 3 || check === 1) {
      return finalresult
    }

    await Promise.all([
      page.click('span.pagination-next > a > ruler-svg-icon-next'),
      page.waitForTimeout(1000),
    ])

    console.log('다음페이지')

    pageNo += 1
  }
}
