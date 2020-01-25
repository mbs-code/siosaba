import { createConnection } from 'typeorm'
import 'reflect-metadata'

import { get } from 'dot-prop'
import { google } from 'googleapis'

import ChannelInserter from './inserter/ChannelInserter'

(async () => {
  console.log('start')
  const conn = await createConnection()

  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY
  })

  const ids = ['UC1CfXB_kRs3C-zaeTG3oGyg']

  const res = await youtube.channels.list({
    part: 'id, snippet, statistics, contentDetails, brandingSettings',
    id: ids.join(','),
    maxResults: 50
  })

  const item: object = get(res, 'data.items.0')

  const ci = new ChannelInserter(item)
  await ci.insert()
})().then(() => {
  console.log()
  process.exit(0)
}).catch((e) => {
  console.error(e)
  process.exit(1)
})
