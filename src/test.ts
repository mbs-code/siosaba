import { createConnection } from 'typeorm'
import 'reflect-metadata'

import { get } from 'dot-prop'
import { google } from 'googleapis'

import ChannelInserter from './inserter/ChannelInserter'
import VideoInserter from './inserter/VideoInserter'
import { Video } from '../database/entity/Video'

(async () => {
  console.log('start')
  const conn = await createConnection()

  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY
  })

  // const ids = ['UC1CfXB_kRs3C-zaeTG3oGyg']

  // const res = await youtube.channels.list({
  //   part: 'id, snippet, statistics, contentDetails, brandingSettings',
  //   id: ids.join(','),
  //   maxResults: 50
  // })

  // const item: object = get(res, 'data.items.0')
  // console.log(item)

  // const ci = new ChannelInserter(item)
  // await ci.insert()
  // console.log(ci)

  const ids = ['r0VBSvkcV7s', 'W1pezP_cI4w', '7u5LqiFPdHs', 'cNZ6PfS64c8']

  const res = await youtube.videos.list({
    part: 'id, snippet, contentDetails, statistics, status, liveStreamingDetails',
    id: ids.join(','),
    maxResults: 50
  })

  const item: object = get(res, 'data.items.0')
  console.log(item)

  const vi = new VideoInserter(item)
  console.log(vi)
  await vi.exec()
})().then(() => {
  console.log()
  process.exit(0)
}).catch((e) => {
  console.error(e)
  process.exit(1)
})
