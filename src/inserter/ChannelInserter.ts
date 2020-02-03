import { get } from 'dot-prop'

import Inserter from './Inserter'
import { Channel } from '../../database/entity/Channel'

export default class ChannelInserter extends Inserter<Channel> {

  protected async insert (item: object) {
    const c = await Channel.findOrCreate({ key: get(item, 'id') })
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

  ///

  private _splitKeywords (keyword: string) {
    if (keyword) {
      return keyword.split(' ')
    }
  }
}
