import { get } from 'dot-prop'

import { Channel } from '../../database/entity/Channel'

export default class ChannelInserter {
  item: object

  constructor (item: object) {
    this.item = item
  }

  async insert () {
    const item = this.item

    const ch = await Channel.findOrCreate({ key: get(item, 'id') })
    ch.key = get(item, 'id')

    ch.title = get(item, 'snippet.title')
    ch.description = get(item, 'snippet.description')
    ch.publishedAt = new Date(get(item, 'snippet.publishedAt'))
    ch.thumbnail = get(item, 'snippet.thumbnails.default.url')
    ch.thumbnailHires = this._extractHiresThumbnail(get(item, 'snippet.thumbnails', []))
    ch.playlist = get(item, 'contentDetails.relatedPlaylists.uploads')
    ch.keyword = get(item, 'brandingSettings.channel.keywords')
    ch.banner = get(item, 'brandingSettings.image.bannerImageUrl')
    ch.bannerHires = get(item, 'brandingSettings.image.bannerTvHighImageUrl')
    ch.publishedAt = new Date(get(item, 'snippet.publishedAt'))

    ch.view = get(item, 'statistics.viewCount')
    ch.comment = get(item, 'statistics.commentCount')
    ch.subscriber = get(item, 'statistics.subscriberCount')
    ch.video = get(item, 'statistics.videoCount')

    await ch.save()
  }

  ///

  private _extractHiresThumbnail = function (thumbnails: Object[]) {
    const types = ['maxers', 'standard', 'high', 'medium', 'default']
    for (const type of types) {
      const thumb: string = get(thumbnails, `${type}.url`)
      if (thumb) {
        return thumb
      }
    }
    return undefined
  }
}
