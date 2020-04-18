import { get } from 'dot-prop'

import { youtube_v3 as youtubeV3 } from 'googleapis' // eslint-disable-line no-unused-vars

import Inserter from './Inserter'
import { Channel } from '../../database/entity/Channel'

export default class ChannelInserter extends Inserter<Channel> {
  youtube: youtubeV3.Youtube

  constructor (youtube: youtubeV3.Youtube) {
    super()
    this.youtube = youtube
  }

  protected async fetch (ids: string[]) {
    // Doc: https://developers.google.com/youtube/v3/docs/channels/list?hl=en
    // quota: 0,2,2,2,2 = 8
    const response = await this.youtube.channels.list({
      part: 'id, snippet, statistics, contentDetails, brandingSettings',
      id: ids.join(','),
      maxResults: 50
    })

    const items: object[] = get(response, 'data.items')
    return items
  }

  protected async insert (key: string, item: object) {
    const c = await Channel.findOrCreate({ key: key })
    c.key = get(item, 'id')
    ///
    c.title = get(item, 'snippet.title')
    c.description = get(item, 'snippet.description')
    c.thumbnail = get(item, 'snippet.thumbnails.default.url')
    c.thumbnailHires = this.extractHiresThumbnail(get(item, 'snippet.thumbnails', []))
    c.playlist = get(item, 'contentDetails.relatedPlaylists.uploads')
    c.tags = this._splitKeywords(get(item, 'brandingSettings.channel.keywords'))
    c.banner = get(item, 'brandingSettings.image.bannerImageUrl')
    c.bannerHires = get(item, 'brandingSettings.image.bannerTvHighImageUrl')
    c.publishedAt = this.parseDatetime(get(item, 'snippet.publishedAt'))
    ///
    c.view = get(item, 'statistics.viewCount')
    c.comment = get(item, 'statistics.commentCount')
    c.subscriber = get(item, 'statistics.subscriberCount')
    c.video = get(item, 'statistics.videoCount')

    await c.save()
    return c
  }

  protected async delete (key: string, item: object) {
    throw new Error(`Channel ID is not found. id: ${key}`)
  }

  /// ////////////////////////////////////////////////////////////

  private _splitKeywords (keyword: string) {
    if (keyword) {
      return keyword.split(' ')
    }
  }
}
