import { filterSeries } from 'p-iteration'
import { flatten } from 'array-flatten'
import { google, youtube_v3 as youtubeV3 } from 'googleapis' // eslint-disable-line no-unused-vars

import dayjs from 'dayjs'
import { cron as Logger, EOL } from './lib/logger'

import ChannelQueryBuilder from './collector/builder/channelQueryBuilder'
import VideoQueryBuider from './collector/builder/VideoQueryBuider'
import ChannelInserter from './inserter/ChannelInserter'
import VideoInserter from './inserter/VideoInserter'
import { VideoType } from '../database/entity/type/VideoType'
import ChannelFeedCollector from './collector/ChannelFeedCollector'

export default class Command {
  youtube: youtubeV3.Youtube

  constructor (youtube?: youtubeV3.Youtube) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.GOOGLE_API_KEY
    })
  }

  /// ////////////////////////////////////////////////////////////

  async updateChannels () {
    // channel を全て更新する
    Logger.info('RUN - Update All Channels. -----------------------')
    const cids = await ChannelQueryBuilder.builder().exec()
    await this.insertChannels(cids)
  }

  async updatePreviousWeekVideos (date: dayjs.Dayjs) {
    // 一週間分の過去の video と archive を更新する
    Logger.info('RUN - Update Previous Week Videos. ---------------')
    const vids = await VideoQueryBuider.builder()
      .type(VideoType.ARCHIVE, VideoType.VIDEO, VideoType.PREMIERE)
      .timeRange(-60 * 24 * 7, 0, date)
      .exec()
    await this.insertVideos(vids)
  }

  async updateActiveVideos (date: dayjs.Dayjs) {
    // live と 前1Hourの archive と video を更新する
    Logger.info('RUN - Update Active Videos. ----------------------')
    const lives = await VideoQueryBuider.builder()
      .type(VideoType.LIVE)
      .exec()

    const videos = await VideoQueryBuider.builder()
      .type(VideoType.ARCHIVE, VideoType.VIDEO, VideoType.PREMIERE)
      .timeRange(-60, 0, date)
      .exec()

    const vids = await this.merge(lives, videos)
    await this.insertVideos(vids)
  }

  async updateUpcomingVideos () {
    Logger.info('RUN - Update Upcoming Videos. --------------------')
    // 全ての upcoming video を更新する
    const vids = await VideoQueryBuider.builder()
      .type(VideoType.UPCOMING)
      .exec()
    await this.insertVideos(vids)
  }

  async updateSoonUpcomingVideos (date: dayjs.Dayjs, hour: number = 1) {
    Logger.info('RUN - Update Soon Upcoming Videos. ---------------')
    // 前NHourの upcoming video を更新する
    const vids = await VideoQueryBuider.builder()
      .type(VideoType.UPCOMING)
      .timeRange(-60 * hour, 0, date)
      .exec()
    await this.insertVideos(vids)
  }

  async fetchFeedVideos () {
    // feed から video を収集する
    Logger.info('RUN - Fetch Feed Videos. -------------------------')
    const cids = await ChannelQueryBuilder.builder().exec()

    const cfc = new ChannelFeedCollector({ strict: false })
    const feedVids = await cfc.exec(cids)

    await this.insertVideos(feedVids)
  }

  /// ////////////////////////////////////////////////////////////

  async merge (...array: any[][]) {
    // 結合
    const items = flatten(array)

    // フィルタリング (重複、空要素を削除)
    const filterItems = await filterSeries(items, async (val, index, array) => {
      return val && array.indexOf(val) === index
    })

    return filterItems
  }

  private async insertChannels (channelds: string[]) {
    const ci = new ChannelInserter(this.youtube)
    await ci.exec({ ids: channelds })
  }

  private async insertVideos (channelds: string[]) {
    const ci = new VideoInserter(this.youtube)
    await ci.exec({ ids: channelds })
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

      // ■ 12時間おきに (0:00, 12:00)
      if (hour % 12 === 0 && minute === 0) {
        // channel を全て更新する
        await this.updateChannels()

        // 一週間分の過去の video と archive を更新する
        await this.updatePreviousWeekVideos(day)
      }

      // ■ 1時間おきに
      if (minute === 0) {
        // 全ての upcoming video を更新する
        await this.updateUpcomingVideos()
      }

      // ■ 5分おきに (0, 5, 10, 15 ...)
      if (minute % 5 === 0) {
        // live と 前1Hourの archive と video を更新する
        await this.updateActiveVideos(day)

        // 前NHourの upcoming video を更新する
        await this.updateSoonUpcomingVideos(day, 1)
      }

      // ■ 15分おきに (5, 20, 35, 50)
      if ((minute - 5) % 15 === 0) {
        // feed から video を収集する
        await this.fetchFeedVideos()
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
