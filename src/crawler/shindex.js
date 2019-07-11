import HCCrawler from 'headless-chrome-crawler'
import moment from 'moment'

export default async ({ date, url }) => {
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
      await page.exposeFunction('__getExtractors', () => ({ _date, _url: url }))
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
    retryDelay: 10 * 1000,
    waitFor: {
      selectorOrFunctionOrTimeout: () => !!$('#price9').text()
    },
    evaluatePage: async () => {
      const { _url } = await window.__getExtractors()
      const [ title, description, picurl, url ] = [
        $('#price9').text() + ' ' + $('#km2').text() + ($('#price9').hasClass('red') ? '↑' : '↓'),
        $('body div.fr.w790 > div.w578 > div.gszb.mb10 > div.rox').text(),
        $('#picr').attr('src'),
        _url
      ]
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
