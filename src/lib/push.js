import axios from 'axios'
import config from 'config'

async function request (data = {}) {
  const url = config.get('bot.webhook')
  await axios.post(url, data)
}

async function pushNews (data) {
  const {
    title,
    description,
    picurl,
    url
  } = data
  console.log('TCL: --------------------------')
  console.log('TCL: pushNews -> data', data)
  console.log('TCL: --------------------------')
  await request({
    'msgtype': 'news',
    'news': {
      'articles': [{
        title,
        description,
        url,
        picurl
      }]
    }
  })
}

export {
  pushNews
}
