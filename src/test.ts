import { Video } from './../database/entity/Video';
import { VideoType } from './../database/entity/type/VideoType';
import { createConnection } from 'typeorm'
import 'reflect-metadata'

import { get } from 'dot-prop'
import { google } from 'googleapis'

import ChannelCollector from './collector/ChannelCollector'
import ChannelFeedCollector from './collector/ChannelFeedCollector'
// import LiveVideoCollector from './collector/LiveVideoCollector'

import ChannelInserter from './inserter/ChannelInserter'
import VideoInserter from './inserter/VideoInserter'
import Command from './command'
import LiveVideoCollector from './collector/LiveVideoCollector'

import VideoQueryBuider from './collector/builder/VideoQueryBuider'
import ChannelQueryBuilder from './collector/builder/ChannelQueryBuilder'
import VideoReFormatter from './collector/batch/videoReformatter';

(async () => {
  console.log('start')
  const conn = await createConnection()

  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY
  })

  // const videos = await Video.find()
  // const ref = new VideoReFormatter()
  // await ref.format(videos)

  // const v = await Video.findOne({ id: 1741 })
  // const re = new VideoReFormatter()
  // re.format(v)

  // const command = new Command()
  // await command.exec(new Date('2020-03-14 12:05'))

  // const cid = await ChannelQueryBuilder.builder().exec()
  // console.log(cid)

  // const cids = ['UCIdEIHpS0TdkqRkHL5OkLtA']
  // const ci = new ChannelInserter(youtube)
  // await ci.exec({ ids: cids })

  // const cfc = new ChannelFeedCollector({ strict: false })
  // const feedIds = await cfc.exec(cids)

  // const vi = new VideoInserter(youtube)
  // await vi.exec({ ids: feedIds })

  const vids = ['7ATyxLHQCrU']

  const vi = new VideoInserter(youtube)
  await vi.exec({ ids: vids })

  // const cron = new Command()
  // await cron.exec(new Date('2020-02-15 19:05:00'))

  // ■ live video collect -> video insert
  // const lvc = new LiveVideoCollector()
  // const vids = await lvc.exec()
  // const vi = new VideoInserter(youtube)
  // await vi.exec({ ids: vids })

  // ■ feed collect -> video insert
  // const cc = new ChannelCollector()
  // const cids = await cc.exec()
  // const cfc = new ChannelFeedCollector({ strict: false })
  // const feedIds = await cfc.exec(cids)

  // const vi = new VideoInserter(youtube)
  // await vi.exec({ ids: feedIds })

  // ■ db channel collect -> video insert
  // const cc = new ChannelCollector()
  // const cids = await cc.exec()

  // const ci = new ChannelInserter(youtube)
  // await ci.exec({ ids: cids })

  // ■ channel insert
  // const cids = ['UC6oDys1BGgBsIC3WhG1BovQ']
  // const ci = new ChannelInserter(youtube)
  // await ci.exec({ ids: cids })

  // ■ video insert
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
