import { get } from 'dot-prop'
import * as RssParser from 'rss-parser'
import * as sleep from 'sleep'

import { cli as Logger } from '../lib/logger'

import Collector from './Collector'
import { Channel } from '../../database/entity/Channel'
import { Video } from '../../database/entity/Video'

export default class ChannelFeedCollector extends Collector {
  strict: boolean
  rssParser: RssParser

  constructor ({ strict = true }: { strict?: boolean } = {}) {
    super()
    this.strict = strict
    this.rssParser = new RssParser()
  }

  protected async onLoop () {
    await sleep(500)
  }

  protected async fetch (id?: string) {
    // DB に存在するか確認する (strict モード)
    if (this.strict) {
      const channel = await Channel.findOne({ key: id })
      if (!channel) {
        throw new Error(`Channel does not exist in db. id: ${id}`)
      }
    }

    // url 生成
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`
    Logger.trace(`- url: ${url}`)

    // APIを叩く
    const feed = await this.rssParser.parseURL(url)

    const items: object[] = get(feed, 'items')
    return items
  }

  protected async parse (item: object) {
    const feedId: string = get(item, 'id', '')
    const key = feedId.slice(9) // remove yt:video:
    return key
  }

  protected async filter (key: string) {
    // DB に存在するならスキップする
    const count = await Video.count({ key: key })
    return count === 0
  }
}
