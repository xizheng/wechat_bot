const HCCrawler = require('headless-chrome-crawler')

;(async () => {
  const crawler = await HCCrawler.launch({
    maxConcurrency: 1,
    onSuccess: result => {
      console.log('onSuccess', result.result)
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
    url: 'http://dota.uuu9.com',
    retryCount: 60 * 5,
    retryDelay: 60 * 1000,
    evaluatePage: () => {
      const $dom = $('.nrtjbox>a>i:contains(每日D报)').parent('a')
      const [ desc, img, link ] = [
        $dom.attr('title'),
        $dom.children('img').attr('src'),
        $dom.attr('href')
      ]
      const date = desc.match(/\d+月\d+日/)[0].replace(/[^\d]|0+/g, '')
      const title = desc.replace(/.*：/, '')
      const today = `${new Date().getMonth() + 1}${new Date().getDate()}`
      if (date === today) {
        return { desc, date, title, img, link, today }
      } else {
        throw new Error()
      }
    }
  })
  await crawler.onIdle()
  await crawler.close()
})()
