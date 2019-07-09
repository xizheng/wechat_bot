import moment from 'moment'
import { isObject, map } from 'lodash'

export default class {
  constructor (job) {
    this.job = {
      id: job.id,
      type: job.data.type
    }
  }
  l (...params) {
    const list = [
      `[${moment().format('YYYY-MM-DD HH:mm:ss')}]`,
      `Job ${this.job.type}:`,
      ...map(params, item => isObject(item) ? JSON.stringify(item) : item)
    ]
    console.log(list.join(' '))
  }
}
