import { LessThanOrEqual } from 'typeorm'

import VideoCollector from './VideoCollector'
import { VideoType } from '../../database/entity/type/VideoType'
import dayjs from 'dayjs'

interface upcomingVideoQueryInterface {
  type: VideoType
  startTime?: any
}

export default class UpcomingVideoCollector extends VideoCollector {
  limitDate: Date|dayjs.Dayjs
  dateLength: number // minute

  constructor (limitDate?: Date|dayjs.Dayjs, dateLength?: number) {
    super()
    this.limitDate = limitDate
    this.dateLength = dateLength || 60
  }

  protected getWhereQuery () {
    const query: upcomingVideoQueryInterface = {
      type: VideoType.UPCOMING
    }

    if (this.limitDate) {
      // 現在か指定した時間 から 決められた時間までの範囲 (1hour)
      const beforeHour = dayjs().add(this.dateLength, 'minute').toDate()
      query.startTime = LessThanOrEqual(beforeHour)
    }

    return query
  }
}
