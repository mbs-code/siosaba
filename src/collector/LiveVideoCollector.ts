import { get } from 'dot-prop'

import { In } from 'typeorm'

import Collector from './Collector'
import { Video } from '../../database/entity/Video'
import { VideoType } from '../../database/entity/type/VideoType'

export default class LiveVideoCollector extends Collector {
  protected async fetch (id?: string) {
    // DB から全て取り出す
    // 配信予定と配信中のやつ
    const videos = await Video.find({
      where: {
        type: In([VideoType.UPCOMING, VideoType.LIVE])
      },
      select: ['key']
    })
    return videos
  }

  protected async parse (item: object) {
    const key: string = get(item, 'key')
    return key
  }
}
