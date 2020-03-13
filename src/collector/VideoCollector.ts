import {
  In,
  LessThan,
  MoreThanOrEqual,
  Not
} from 'typeorm'

import { get } from 'dot-prop'
import dayjs from 'dayjs'

import Collector from './Collector'
import { Video } from '../../database/entity/Video'
import { VideoType } from './../../database/entity/type/VideoType' // eslint-disable-line no-unused-vars
import { VideoStatus } from './../../database/entity/type/VideoStatus' // eslint-disable-line no-unused-vars

export default class VideoCollector extends Collector {
  types: VideoType[]
  beforeMinute: number
  afterMinute: number
  baseDate?: Date|dayjs.Dayjs
  excludeDelete: boolean

  constructor (types: VideoType[], beforeMinute: number, afterMinute: number, baseDate: Date|dayjs.Dayjs, excludeDelete: boolean) {
    super()
    this.types = types
    this.beforeMinute = beforeMinute
    this.afterMinute = afterMinute
    this.baseDate = baseDate
    this.excludeDelete = excludeDelete
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

  // can override
  protected getWhereQuery () {
    if (this.types || this.beforeMinute !== 0 || this.afterMinute !== 0 || this.excludeDelete) {
      const query: any = {}

      // 種別検索
      if (this.types.length > 0) {
        query.type = this.types.length > 1
          ? In(this.types)
          : this.types[0]
      }

      // 時間抽出
      if (this.beforeMinute !== 0) {
        const base = dayjs(this.baseDate)
        const start = base.add(this.beforeMinute, 'minute')
        const end = base.add(this.afterMinute, 'minute')
        const ss = start.format('YYYY-MM-DD HH:mm:ss')
        const ee = end.format('YYYY-MM-DD HH:mm:ss')

        query.endTime = MoreThanOrEqual(ss) // >=
        query.startTime = LessThan(ee) // <
      }

      // status = private を除外する
      if (this.excludeDelete) {
        query.status = Not(VideoStatus.PRIVATE)
      }
      return query
    }
    return undefined
  }
}
