import { get } from 'dot-prop'

import * as dayjs from 'dayjs'

import Inserter from './Inserter'
import { Video } from '../../database/entity/Video'
import { VideoType } from '../../database/entity/type/VideoType'
import { VideoStatus } from '../../database/entity/type/VideoStatus'

export default class VideoInserter extends Inserter<Video> {
  protected async insert (item: object) {
    const v = await Video.findOrCreate({ key: get(item, 'id') })
    v.key = get(item, 'id')
    ///
    v.title = get(item, 'snippet.title')
    v.description = get(item, 'snippet.description')
    v.thumbnail = get(item, 'snippet.thumbnails.default.url')
    v.thumbnailHires = this.extractHiresThumbnail(get(item, 'snippet.thumbnails'))
    v.type = this._parseType(item)
    v.status = this._parseStatus(item)
    v.duration = this.parseDuration((get(item, 'contentDetails.duration')))
    // video.startTime = null // 後で挿入
    // video.endTime = null // 後で挿入
    v.scheduledStartTime = this.parseDatetime(get(item, 'liveStreamingDetails.scheduledStartTime'))
    v.scheduledEndTime = this.parseDatetime(get(item, 'liveStreamingDetails.scheduledEndTime'))
    v.actualStartTime = this.parseDatetime(get(item, 'liveStreamingDetails.actualStartTime'))
    v.actualEndTime = this.parseDatetime(get(item, 'liveStreamingDetails.actualEndTime'))
    v.tags = get(item, 'snippet.tags')
    v.liveChatKey = v.liveChatKey || get(item, 'liveStreamingDetails.activeLiveChatId') // 値が入ったら上書き禁止
    v.publishedAt = this.parseDatetime(get(item, 'snippet.publishedAt'))

    const stEdTime = this._calcStartEndTime(v)
    v.startTime = stEdTime.start
    v.endTime = stEdTime.end
    ///
    v.view = get(item, 'statistics.viewCount')
    v.like = get(item, 'statistics.likeCount')
    v.dislike = get(item, 'statistics.dislikeCount')
    v.favorite = get(item, 'statistics.favoriteCount')
    v.comment = get(item, 'statistics.commentCount')
    v.concurrentViewers = get(item, 'liveStreamingDetails.concurrentViewers')

    await v.save()
    return v
  }

  ///

  private _calcStartEndTime = function (video: Video) {
    if (video.type === VideoType.ARCHIVE) {
      // アーカイブなら 開始時刻 => 終了時刻
      return {
        start: video.actualStartTime,
        end: video.actualEndTime
      }
    } else if (video.type === VideoType.LIVE) {
      // 配信中なら 開始時刻 => 現在時刻
      return {
        start: video.actualStartTime,
        end: new Date()
      }
    } else if (video.type === VideoType.UPCOMING) {
      // 配信予約中なら 予定時刻 => +1min
      const end = dayjs(video.scheduledStartTime).add(1, 'minute').toDate()
      return {
        start: video.scheduledStartTime,
        end: end
      }
    } else if (video.type === VideoType.VIDEO) {
      // 動画なら 投稿時間 => +duration
      const duration = video.duration
      const end = dayjs(video.publishedAt).add(duration, 'minute').toDate()
      return {
        start: video.publishedAt,
        end: end
      }
    }

    return {}
  }

  private _parseType = function (item: object) {
    const liveBroadcastContent = get(item, 'snippet.liveBroadcastContent')
    const actualEndTime = get(item, 'liveStreamingDetails.actualEndTime') // 配信終了時刻 (動画なら無い)

    if (liveBroadcastContent === 'upcoming') {
      return VideoType.UPCOMING
    } else if (liveBroadcastContent === 'live') {
      return VideoType.LIVE
    } else {
      if (actualEndTime) {
        return VideoType.ARCHIVE
      } else {
        return VideoType.VIDEO
      }
    }
  }

  private _parseStatus = function (item: object) {
    const privacyStatus = get(item, 'status.privacyStatus')

    if (privacyStatus === 'public') {
      return VideoStatus.PUBLIC
    } else if (privacyStatus === 'unlisted') {
      return VideoStatus.UNLISTED
    } else if (privacyStatus === 'private') {
      return VideoStatus.PRIVATE
    }
  }
}
