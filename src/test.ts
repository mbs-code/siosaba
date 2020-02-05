import { createConnection } from 'typeorm'
import 'reflect-metadata'

import { get } from 'dot-prop'
import { google } from 'googleapis'

import ChannelFeedCollector from './collector/ChannelFeedCollector'

import ChannelInserter from './inserter/ChannelInserter'
import VideoInserter from './inserter/VideoInserter'

(async () => {
  console.log('start')
  const conn = await createConnection()

  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY
  })

  const cids = ['UC1CfXB_kRs3C-zaeTG3oGyg', 'UC1opHUrw8rvnsadT-iGp7Cg']
  const cfc = new ChannelFeedCollector({ strict: false })
  const feedIds = await cfc.exec(cids)

  const vi = new VideoInserter(youtube)
  await vi.exec({ ids: feedIds })

  // const cids = ['UC1CfXB_kRs3C-zaeTG3oGyg']
  // const ci = new ChannelInserter(youtube)
  // await ci.exec({ ids: cids })

  // const vids = ['U_Fe0ICGNdcs']
  // const vi = new VideoInserter(youtube)
  // await vi.exec({ ids: vids })

})().then(() => {
  console.log()
  process.exit(0)
}).catch((e) => {
  console.error(e)
  process.exit(1)
})
