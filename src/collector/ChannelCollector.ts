import { get } from 'dot-prop'

import Collector from './Collector'
import { Channel } from '../../database/entity/Channel'

export default class ChannelCollector extends Collector {
  async fetch (id?: string) {
    // DB から全て取り出す
    const channels = await Channel.find({ select: ['key'] })
    return channels
  }

  async parse (item: object) {
    const key: string = get(item, 'key')
    return key
  }
}
