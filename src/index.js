import config from 'config'
import Queue from 'bull'
import minimist from 'minimist'
import { pushNews } from './lib/push'
import Log from './lib/JobLogger'

const argv = minimist(process.argv.slice(2), {
  default: { push: true },
  boolean: [ 'push' ]
})
console.log('TCL: --------------')
console.log('TCL: argv', argv)
console.log('TCL: --------------')

const tasks = new Queue('Wechat Bot')

tasks.process(async (job, done) => {
  const log = new Log(job)
  log.l('start')
  const runner = require(`./crawler/${job.data.type}`).default
  const news = await runner(job.data.options)
  log.l('news', news)
  argv.push && await pushNews(news)
  log.l('done')
  done(news)
})

function addTask (type) {
  const { cron, ...options } = config.get(type)
  tasks.add({
    type,
    options
  }, {
    repeat: cron ? { cron } : undefined
  })
}

addTask('diaobao')
addTask('shindex')
