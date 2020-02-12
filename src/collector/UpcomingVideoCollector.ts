import VideoCollector from './VideoCollector'
import { VideoType } from '../../database/entity/type/VideoType'

export default class UpcomingVideoCollector extends VideoCollector {
  protected getWhereQuery () {
    return {
      type: VideoType.UPCOMING
    }
  }
}
