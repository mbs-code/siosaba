
import dayjs from 'dayjs' // eslint-disable-line no-unused-vars

import { VideoType } from './../../../database/entity/type/VideoType' // eslint-disable-line no-unused-vars
import VideoCollector from '../VideoCollector'

export default class VideoQueryBuilder {
  private types: VideoType[]
  private moveMinute: number
  private baseDate?: Date|dayjs.Dayjs
  private excludeDelete: boolean

  static builder () {
    return new this()
  }

  async exec () {
    const vc = new VideoCollector(
      this.types,
      this.moveMinute,
      this.baseDate,
      this.excludeDelete
    )

    const val = await vc.exec()
    return val
  }

  /// ////////////////////////////////////////////////////////////

  constructor () {
    this.types = []
    this.moveMinute = 0
    this.baseDate = undefined
    this.excludeDelete = false
  }

  type (...type: VideoType[]) {
    this.types.push(...type)
    return this
  }

  timeRange (moveMinute: number, baseDate?: Date|dayjs.Dayjs) {
    this.moveMinute = moveMinute
    this.baseDate = baseDate
    return this
  }

  excludeDeleteVideo () {
    this.excludeDelete = true
    return this
  }
}
