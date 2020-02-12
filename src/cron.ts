import * as schedule from 'node-schedule'
import { google, youtube_v3 as youtubeV3 } from 'googleapis'

import ChannelCollector from './collector/ChannelCollector'
import ChannelInserter from './inserter/ChannelInserter'
import ChannelFeedCollector from './collector/ChannelFeedCollector'
import VideoInserter from './inserter/VideoInserter'
import LiveVideoCollector from './collector/LiveVideoCollector'
import UpcomingVideoCollector from './collector/UpcomingVideoCollector'

export default class Cron {
  youtube: youtubeV3.Youtube

  constructor (youtube?: youtubeV3.Youtube) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.GOOGLE_API_KEY
    })
  }

  async exec () {
    // schedule.scheduleJob('* * * * *', function () {
    //   console.log('The answer to life, the universe, and everything!')
    // })
    // await this.updateChannels('UC1519-d1jzGiL1MPTxEdtSA')
    // await this.updateFeedVideos()
    await this.updateUpcomingVideos()
  }

  async updateUpcomingVideos (...channelIds: string[]) {
    const uvc = new UpcomingVideoCollector()
    const liveVids = await uvc.exec()

    await this.updateVideos(...liveVids)
  }

  async updateLiveVideos () {
    const lvc = new LiveVideoCollector()
    const liveVids = await lvc.exec()

    await this.updateVideos(...liveVids)
  }

  async updateFeedVideos (...channelIds: string[]) {
    let cids = channelIds
    if (!cids || cids.length === 0) {
      const cc = new ChannelCollector()
      cids = await cc.exec(channelIds)
    }

    const cfc = new ChannelFeedCollector({ strict: false })
    const feedVids = await cfc.exec(cids)

    await this.updateVideos(...feedVids)
  }

  /// ////////////////////////////////////////////////////////////

  async updateChannels (...channelIds: string[]) {
    let cids = channelIds
    if (!cids || cids.length === 0) {
      const cc = new ChannelCollector()
      cids = await cc.exec(channelIds)
    }

    const ci = new ChannelInserter(this.youtube)
    await ci.exec({ ids: cids })
  }

  async updateVideos (...videoIds: string[]) {
    const vi = new VideoInserter(this.youtube)
    await vi.exec({ ids: videoIds })
  }
}
