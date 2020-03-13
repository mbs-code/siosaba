import dayjs from 'dayjs' // eslint-disable-line no-unused-vars

import { VideoType } from './../../../database/entity/type/VideoType' // eslint-disable-line no-unused-vars
import VideoCollector from '../VideoCollector'

export default class VideoQueryBuilder {
  private types: VideoType[]
  private beforeMinute: number
  private afterMinute: number
  private baseDate?: Date|dayjs.Dayjs
  private excludeDelete: boolean

  static builder () {
    return new this()
  }

  async exec () {
    const vc = new VideoCollector(
      this.types,
      this.beforeMinute,
      this.afterMinute,
      this.baseDate,
      this.excludeDelete
    )

    const val = await vc.exec()
    return val
  }

  /// ////////////////////////////////////////////////////////////

  constructor () {
    this.types = []
    this.beforeMinute = 0
    this.afterMinute = 0
    this.baseDate = undefined
    this.excludeDelete = false
  }

  type (...type: VideoType[]) {
    this.types.push(...type)
    return this
  }

  timeRange (beforeMinute: number, afterMinute: number, baseDate?: Date|dayjs.Dayjs) {
    this.beforeMinute = beforeMinute
    this.afterMinute = afterMinute
    this.baseDate = baseDate
    return this
  }

  excludeDeleteVideo () {
    this.excludeDelete = true
    return this
  }
}
