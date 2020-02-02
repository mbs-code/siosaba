import { get } from 'dot-prop'

import Inserter from './Inserter'
import { Channel } from '../../database/entity/Channel'

export default class ChannelInserter extends Inserter {
  item: object

  constructor (item: object) {
    super()
    this.item = item
  }

  async insert () {
    const item = this.item

    const channel = await Channel.findOrCreate({ key: get(item, 'id') })
    channel.key = get(item, 'id')
    ///
    channel.title = get(item, 'snippet.title')
    channel.description = get(item, 'snippet.description')
    channel.thumbnail = get(item, 'snippet.thumbnails.default.url')
    channel.thumbnailHires = this._extractHiresThumbnail(get(item, 'snippet.thumbnails', []))
    channel.playlist = get(item, 'contentDetails.relatedPlaylists.uploads')
    channel.tags = this._splitKeywords(get(item, 'brandingSettings.channel.keywords'))
    channel.banner = get(item, 'brandingSettings.image.bannerImageUrl')
    channel.bannerHires = get(item, 'brandingSettings.image.bannerTvHighImageUrl')
    channel.publishedAt = this.parseDatetime(get(item, 'snippet.publishedAt'))
    ///
    channel.view = get(item, 'statistics.viewCount')
    channel.comment = get(item, 'statistics.commentCount')
    channel.subscriber = get(item, 'statistics.subscriberCount')
    channel.video = get(item, 'statistics.videoCount')

    await channel.save()
  }

  ///

  private _splitKeywords (keyword: string) {
    if (keyword) {
      return keyword.split(' ')
    }
  }
}
