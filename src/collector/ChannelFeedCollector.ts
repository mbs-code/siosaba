import { get } from 'dot-prop'
import * as RssParser from 'rss-parser'

import Collector from './Collector'
import { Channel } from '../../database/entity/Channel'

export default class ChannelFeedCollector extends Collector {
  strict: boolean
  rssParser: RssParser

  constructor ({ strict = true }: { strict?: boolean } = {}) {
    super()
    this.strict = strict
    this.rssParser = new RssParser()
  }

  async fetch (id: string) {
    // DB に存在するか確認する (strict モード)
    if (this.strict) {
      const channel = await Channel.findOne({ key: id })
      if (!channel) {
        throw new Error(`Channel does not exist in db. id: ${id}`)
      }
    }

    // APIを叩く
    const feed = await this.rssParser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`)

    const items: object[] = get(feed, 'items')
    return items
  }

  async parse (item: object) {
    const feedId: string = get(item, 'id', '')
    const id = feedId.slice(9) // remove yt:video:
    return id
  }
}
