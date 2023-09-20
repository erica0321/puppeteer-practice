import puppeteer, { Page } from 'puppeteer'
import type { Result } from './types'
;(async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  const url =
    'https://www.shopcider.com/search/results?q=%ED%82%A4%EB%A7%81&key_word_type=Normal&listSource=product_list-3358;search_word;0'

  const result: Result = await extract(url, page)

  console.log(JSON.stringify(result))
  console.log(`아이템 수 ${result.length}`)

  // await browser.close()
})()

//한페이지내 item 리스트 반환
async function getItems(page: Page) {
  return await page.$$eval('.product-list-item-box', async listItem => {
    return listItem.map(item => ({
      // image: item.querySelector('img.first-image').src,
      name: item.querySelector('span.product-item-name').textContent.trim(),
      price: item
        .querySelector('div.product-item-main-price ')
        .textContent.trim(),
    }))
  })
}

async function extract(url: string, page: Page) {
  const result: Result = []
  await page.goto(url)
  let lastHeight = await page.evaluate('document.body.scrollHeight')
  while (true) {
    //밑으로 스크롤
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
    await sleep(1000)
    //다음 스크롤 위치 찾기
    let newHeight = await page.evaluate('document.body.scrollHeight')
    const itemNum = await page.$$eval(
      '.product-list-item-box',
      data => data.length
    )
    //상품 개수가 100개 넘거나, 스크롤이 끝날때
    if (newHeight == lastHeight || itemNum >= 100) {
      break
    }
    
    lastHeight = newHeight
  }
  const items = await getItems(page)
  result.push(...items)

  return result.slice(0, 100)
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
