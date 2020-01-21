import { createConnection } from 'typeorm'
import 'reflect-metadata'

import { Channel } from './../database/entity/Channel'

(async () => {
  await createConnection()

  const c = await Channel.findOne({ key: '111' })
  c.title = '新タイトル'
  console.log(c.getChangeValues())
  await c.save()
  console.log(c.getChangeValues())

})().then(() => {
  process.exit(0)
}).catch((e) => {
  console.error(e)
  process.exit(1)
})
