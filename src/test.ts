import { createConnection } from 'typeorm'
import 'reflect-metadata'

import { get } from 'dot-prop'
import { google } from 'googleapis'

import { Channel } from './../database/entity/Channel'
import { ChannelMeta } from './../database/entity/ChannelMeta'
import { ChannelStat } from './../database/entity/ChannelStat'

(async () => {
  const conn = await createConnection()

  
  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY
  })

  const ids = ['UC1CfXB_kRs3C-zaeTG3oGyg']

  const res = await youtube.channels.list({
    part: 'id, snippet, statistics, contentDetails, brandingSettings',
    id: ids.join(','),
    maxResults: 50
  })

  const item: object = get(res, 'data.items.0')

  const extractHiresThumbnail = function (thumbnails: Object[]) {
    const types = ['maxers', 'standard', 'high', 'medium', 'default']
    for (const type of types) {
      const thumb: string = get(thumbnails, `${type}.url`)
      if (thumb) {
        return thumb
      }
    }
    return undefined
  }

  const meta = new ChannelMeta()
  meta.title = get(item, 'snippet.title')
  meta.description = get(item, 'snippet.description')
  meta.publishedAt = new Date(get(item, 'snippet.publishedAt'))
  meta.thumbnail = get(item, 'snippet.thumbnails.default.url')
  meta.thumbnailHires = extractHiresThumbnail(get(item, 'snippet.thumbnails', []))
  meta.playlist = get(item, 'contentDetails.relatedPlaylists.uploads')
  meta.keyword = get(item, 'brandingSettings.channel.keywords')
  meta.banner = get(item, 'brandingSettings.image.bannerImageUrl')
  meta.bannerHires = get(item, 'brandingSettings.image.bannerTvHighImageUrl')

  const stat = new ChannelStat()
  stat.view = get(item, 'statistics.viewCount')
  stat.comment = get(item, 'statistics.commentCount')
  stat.subscriber = get(item, 'statistics.subscriberCount')
  stat.video = get(item, 'statistics.videoCount')

  const c = new Channel()
  c.key = get(item, 'id')
  c.metas = [meta]
  c.stats = [stat]

  console.log(c)
  await conn.manager.save(c)

  console.log('--------')
  console.log(c)

  // const c = await Channel.findOne({ key: 'UC1CfXB_kRs3C-zaeTG3oGyg' }, { relations: ['metas'] })
  // console.log(c)
})().then(() => {
  process.exit(0)
}).catch((e) => {
  console.error(e)
  process.exit(1)
})
