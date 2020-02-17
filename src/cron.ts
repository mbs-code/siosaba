import schedule from 'node-schedule'
import Command from './command'

export default class Cron {
  cli: Command

  constructor () {
    this.cli = new Command()
    schedule.scheduleJob('*/5 * * * *', async (fireDate) => {
      await this.cli.exec(fireDate)
    })
  }
}
