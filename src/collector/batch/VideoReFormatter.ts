import VideoInserter from '../../inserter/VideoInserter'
import { Video } from '../../../database/entity/Video' // eslint-disable-line no-unused-vars

import { cli as Logger } from '../../lib/logger'

// TODO: delete された end_time が 現在時刻になる不具合
export default class VideoReFormatter {
  async format (videos: Video[]) {
    const ins = new VideoInserter(undefined)

    Logger.info('Start video reformatter. len: %s', videos.length)
    for (let i = 0; i < videos.length; i++) {
      const v = videos[i]
      ins.batch(v)
      await v.save()

      Logger.debug('> [%d/%d] save: [%s] %s', i + 1, videos.length, v.key, v.title)
    }
    Logger.info('Success!')
  }
}
