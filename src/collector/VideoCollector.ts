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
  moveMinute: number
  baseDate?: Date|dayjs.Dayjs
  excludeDelete: boolean

  constructor (types: VideoType[], moveMinute: number, baseDate: Date|dayjs.Dayjs, excludeDelete: boolean) {
    super()
    this.types = types
    this.moveMinute = moveMinute
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
    if (this.types || this.moveMinute !== 0 || this.excludeDelete) {
      const query: any = {}

      // 種別検索
      if (this.types.length > 0) {
        query.type = this.types.length > 1
          ? In(this.types)
          : this.types[0]
      }

      // 時間抽出
      if (this.moveMinute !== 0) {
        const base = dayjs(this.baseDate)
        const line = base.add(this.moveMinute, 'minute')
        const bb = base.format('YYYY-MM-DD HH:mm:ss')
        const ll = line.format('YYYY-MM-DD HH:mm:ss')
        if (this.moveMinute > 0) {
          // 基準時 <-> 拡張時
          // Raw(alias => `${alias} < '${ll}' AND ${alias} >= '${bb}'`)
          query.startTime = LessThan(ll) // <
          query.endTime = MoreThanOrEqual(bb) // >=
        } else {
          // 拡張時 <-> 基準時
          // Raw(alias => `${alias} < '${bb}' AND ${alias} >= '${ll}'`)
          query.startTime = LessThan(bb) // <
          query.endTime = MoreThanOrEqual(ll) // >=
        }
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
