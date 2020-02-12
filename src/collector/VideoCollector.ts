import { get } from 'dot-prop'

import Collector from './Collector'
import { Video } from '../../database/entity/Video'

export default class VideoCollector extends Collector {
  protected getWhereQuery () {
    // plz override
    return undefined
  }

  async fetch (id?: string) {
    // DB から全て取り出す
    const videos = await Video.find({
      where: this.getWhereQuery(),
      select: ['key']
    })
    return videos
  }

  async parse (item: object) {
    const key: string = get(item, 'key')
    return key
  }
}
