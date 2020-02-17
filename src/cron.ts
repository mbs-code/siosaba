import schedule from 'node-schedule'
import Command from './command'

import { cli as Logger } from './lib/logger'

export default class Cron {
  cli: Command

  constructor () {
    this.cli = new Command()
    schedule.scheduleJob('*/5 * * * *', async (fireDate) => {
      try {
        await this.cli.exec(fireDate)
      } catch (err) {
        Logger.error(err)
        Logger.error('INTERRUPT!')
      }
    })
  }
}
