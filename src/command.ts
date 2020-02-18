import { google, youtube_v3 as youtubeV3 } from 'googleapis' // eslint-disable-line no-unused-vars

import dayjs from 'dayjs'
import { cron as Logger, EOL } from './lib/logger'

import ChannelCollector from './collector/ChannelCollector'
import VideoCollector from './collector/VideoCollector'

import ChannelInserter from './inserter/ChannelInserter'
import ChannelFeedCollector from './collector/ChannelFeedCollector'
import VideoInserter from './inserter/VideoInserter'
import LiveVideoCollector from './collector/LiveVideoCollector'
import UpcomingVideoCollector from './collector/UpcomingVideoCollector'

export default class Command {
  youtube: youtubeV3.Youtube

  constructor (youtube?: youtubeV3.Youtube) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.GOOGLE_API_KEY
    })
  }

  /// ////////////////////////////////////////////////////////////

  async updateUpcomingVideos () {
    Logger.info('RUN - Update upcoming videos.')
    const uvc = new UpcomingVideoCollector()
    const liveVids = await uvc.exec()

    await this.updateVideos(liveVids)
  }

  async updateSoonUpcomingVideos (date: Date|dayjs.Dayjs) {
    Logger.info('RUN - Update soon upcoming videos.')
    const suvc = new UpcomingVideoCollector(date, 60)
    const liveVids = await suvc.exec()

    await this.updateVideos(liveVids)
  }

  async updateLiveVideos () {
    Logger.info('RUN - Update live videos.')
    const lvc = new LiveVideoCollector()
    const liveVids = await lvc.exec()

    await this.updateVideos(liveVids)
  }

  async updateFeedVideos (channelIds?: string[]) {
    Logger.info('RUN - Collect feed videos.')
    let cids = channelIds
    // 引数が undefined なら全件取得する
    if (!cids) {
      const cc = new ChannelCollector()
      cids = await cc.exec(channelIds)
    }

    const cfc = new ChannelFeedCollector({ strict: false })
    const feedVids = await cfc.exec(cids)

    await this.updateVideos(feedVids)
  }

  /// ////////////////////////////////////////////////////////////

  async updateChannels (channelIds?: string[]) {
    Logger.info('RUN - Update channels.')
    let cids = channelIds
    // 引数が undefined なら全件取得する
    if (!cids) {
      const cc = new ChannelCollector()
      cids = await cc.exec(channelIds)
    }

    const ci = new ChannelInserter(this.youtube)
    await ci.exec({ ids: cids })
  }

  async updateVideos (videoIds?: string[]) {
    Logger.info('RUN - Update videos.')
    let vids = videoIds
    // 引数が undefined なら全件取得する
    if (!vids) {
      const cc = new VideoCollector()
      vids = await cc.exec(videoIds)
    }

    const vi = new VideoInserter(this.youtube)
    await vi.exec({ ids: vids })
  }

  /// ////////////////////////////////////////////////////////////

  async exec (date: Date) {
    const day = dayjs(date)
    const { hour, minute } = { hour: day.hour(), minute: day.minute() }

    const start = dayjs() // 処理タイマ用

    try {
      Logger.info('------------------------------------------------------------')
      Logger.info('START - Batch processing.')
      Logger.info('- date: %s', day.format('YYYY-MM-DD HH:mm:ss.sss'))
      Logger.info('------------------------------------------------------------')

      // 一時間おきに
      if (minute === 0) {
        // channel を更新する
        await this.updateChannels()

        // upcoming video を更新する
        await this.updateUpcomingVideos()
      }

      // 5分おきに
      if (minute % 5 === 0) {
        // 配信中の video を更新する
        await this.updateLiveVideos()

        // 直近の upcoming video を更新する
        await this.updateSoonUpcomingVideos(day)
      }

      // 15分おきに (5, 20, 35, 50)
      if ((minute - 5) % 15 === 0) {
        // feed から video を収集する
        await this.updateFeedVideos()
      }
    } catch (err) {
      Logger.error(err)
      Logger.error('INTERRUPT!')
    } finally {
      const now = dayjs()
      const diffSec = now.diff(start, 'second')
      Logger.info('------------------------------------------------------------')
      Logger.info('FINISH - Batch processing.')
      Logger.info('- date: %s', day.format('YYYY-MM-DD HH:mm:ss.sss'))
      Logger.info('- time: %.2f sec', diffSec)
      Logger.info('------------------------------------------------------------' + EOL)
    }
  }
}
