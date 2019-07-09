import HCCrawler from 'headless-chrome-crawler'
import moment from 'moment'

export default async ({ date, url }) => {
  console.log('TCL: ------------------------')
  console.log('TCL: date, url', date, url)
  console.log('TCL: ------------------------')
  const _date = date || moment().format('MD')
  let res = {}
  const crawler = await HCCrawler.launch({
    maxConcurrency: 1,
    onSuccess: async result => {
      res = result.result
    },
    customCrawl: async (page, crawl) => {
      await page.exposeFunction('__getExtractors', () => ({ _date }))
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
    retryCount: 60 * 5,
    retryDelay: 60 * 1000,
    evaluatePage: async () => {
      const { _date } = await window.__getExtractors()
      const $dom = $('.nrtjbox>a>i:contains(每日D报)').parent('a')
      const [ description, picurl, url ] = [
        $dom.attr('title'),
        $dom.children('img').attr('src'),
        $dom.attr('href')
      ]
      const date = description.match(/\d+月\d+日/)[0].replace(/[^\d]|0+/g, '')
      const title = description.replace(/.*：/, '')
      if (date === _date) {
        return { description, date, title, picurl, url }
      } else {
        throw new Error()
      }
    }
  })
  await crawler.onIdle()
  await crawler.close()
  return res
}
