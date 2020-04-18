import VideoCollector from './VideoCollector'
import { VideoType } from '../../database/entity/type/VideoType'

export default class LiveVideoCollector extends VideoCollector {
  protected getWhereQuery () {
    return {
      type: VideoType.LIVE
    }
  }
}
