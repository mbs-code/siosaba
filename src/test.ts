import { createConnection } from 'typeorm'
import 'reflect-metadata'

import { google } from 'googleapis'

import ChannelInserter from './inserter/ChannelInserter'
import VideoInserter from './inserter/VideoInserter'

(async () => {
  console.log('start')
  const conn = await createConnection()

  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY
  })

  const cids = ['UC1CfXB_kRs3C-zaeTG3oGyg']
  const ci = new ChannelInserter(youtube)
  await ci.exec({ ids: cids })

  const vids = ['r0VBSvkcV7s', 'W1pezP_cI4w', '7u5LqiFPdHs', 'cNZ6PfS64c8']
  const vi = new VideoInserter(youtube)
  await vi.exec({ ids: vids })
})().then(() => {
  console.log()
  process.exit(0)
}).catch((e) => {
  console.error(e)
  process.exit(1)
})
