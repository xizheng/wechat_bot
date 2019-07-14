import HCCrawler from 'headless-chrome-crawler'
import moment from 'moment'

export default async ({ date, url, newsUrl }) => {
  const _date = date || moment().format('MMDD')
  console.log('TCL: ------------------------')
  console.log('TCL: date, url', _date, url)
  console.log('TCL: ------------------------')
  let res = {}
  const crawler = await HCCrawler.launch({
    maxConcurrency: 1,
    args: ['--no-sandbox'],
    onSuccess: async result => {
      res = result.result
    },
    customCrawl: async (page, crawl) => {
      await page.exposeFunction('__getExtractors', () => ({ _date, _url: url, _newsUrl: newsUrl }))
      const result = await crawl()
      return result
    }
  })
  crawler.on('requestfinished', (...params) => {
    console.log('requestfinished')
  })
  crawler.on('requeststarted', (...params) => {
    console.log('requeststarted')
  })
  crawler.on('requestretried', (...params) => {
    console.log('requestretried')
  })
  crawler.on('requestfailed', (...params) => {
    console.log('requestfailed')
  })

  await crawler.queue({
    url,
    retryCount: 5,
    retryDelay: 10 * 1000,
    waitFor: {
      selectorOrFunctionOrTimeout: '.weibo-member'
    },
    evaluatePage: async () => {
      const { _newsUrl } = await window.__getExtractors()
      const $dom = $('.weibo-og').filter(function () {
        return $(this).next('.weibo-rp').length === 0
      }).eq(0)
      const url = _newsUrl
      const description = $dom.find('.weibo-text').text()
      const title = $dom.parents('.card.weibo-member').find('.m-avatar-box').text().replace(/\s+|来自.*/g, ' ').trim()
      const picurl = $dom.find('.weibo-media img:first').attr('src') || $('.m-avatar-box img:first').attr('src')
      return {
        title,
        description,
        picurl,
        url
      }
    }
  })
  await crawler.onIdle()
  await crawler.close()
  return res
}
