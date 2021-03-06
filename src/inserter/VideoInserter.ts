import { get } from 'dot-prop'
import dayjs from 'dayjs'

import { youtube_v3 as youtubeV3 } from 'googleapis' // eslint-disable-line no-unused-vars

import Inserter from './Inserter'
import { Video } from '../../database/entity/Video'
import { VideoType } from '../../database/entity/type/VideoType'
import { VideoStatus } from '../../database/entity/type/VideoStatus'
import { Channel } from '../../database/entity/Channel'

export default class VideoInserter extends Inserter<Video> {
  youtube: youtubeV3.Youtube

  constructor (youtube: youtubeV3.Youtube) {
    super()
    this.youtube = youtube
  }

  protected async fetch (ids: string[]) {
    // Doc: https://developers.google.com/youtube/v3/docs/videos/list?hl=en
    // quota: 0,2,2,2,2,2 = 10
    const response = await this.youtube.videos.list({
      part: 'id, snippet, contentDetails, statistics, status, liveStreamingDetails',
      id: ids.join(','),
      maxResults: 50
    })

    const items: object[] = get(response, 'data.items')
    return items
  }

  protected async insert (key: string, item: object) {
    const v = await Video.findOrCreate({ key: key })
    v.key = get(item, 'id')
    ///
    v.title = get(item, 'snippet.title')
    v.description = get(item, 'snippet.description')
    v.thumbnail = get(item, 'snippet.thumbnails.default.url')
    v.thumbnailHires = this.extractHiresThumbnail(get(item, 'snippet.thumbnails'))
    // v.type = this._parseType(item) // 後で挿入
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
    ///
    v.view = get(item, 'statistics.viewCount')
    v.like = get(item, 'statistics.likeCount')
    v.dislike = get(item, 'statistics.dislikeCount')
    v.favorite = get(item, 'statistics.favoriteCount')
    v.comment = get(item, 'statistics.commentCount')
    v.concurrentViewers = get(item, 'liveStreamingDetails.concurrentViewers')

    // channel との関連付け
    const channelKey: string = get(item, 'snippet.channelId')
    const channel = await Channel.findOne({ key: channelKey })
    if (channel) {
      v.channel = channel
    }

    // バッジ処理
    this.batch(v)

    await v.save()
    return v
  }

  protected async delete (key: string, item: object) {
    const v = await Video.findOne({ key: key })

    // DBに存在する時のみ上書きする
    if (v) {
      v.status = VideoStatus.PRIVATE

      // ライブ中なら終わった時刻をとりあえず現在時刻にしておく
      if (v.type === VideoType.LIVE) {
        v.type = VideoType.ARCHIVE
        v.endTime = new Date()
      }

      await v.save()
      return v
    }

    // DBに存在しない場合は ID Error
    throw new Error(`Video ID is not found. id: ${key}`)
  }

  /// ////////////////////////////////////////////////////////////

  batch (video: Video) {
    // 動画種別の計算
    video.type = this.calcType(video)

    // start と end の計算
    const { start, end } = this.calcStartEndTime(video)
    video.startTime = start
    video.endTime = end

    // 最大同接の計算
    video.maxViewers = this.calcMaxViewers(video)
  }

  private calcType (video: Video) {
    if (video.actualEndTime) {
      // 終了時刻があったらアーカイブ
      if (new Date(video.actualStartTime).getTime() === new Date(video.publishedAt).getTime()) {
        return VideoType.PREMIERE
      }
      return VideoType.ARCHIVE
    } else if (video.actualStartTime) {
      // 開始時刻があったら配信中
      return VideoType.LIVE
    } else if (video.scheduledStartTime) {
      // 予定時刻があったら待機中
      return VideoType.UPCOMING
    }

    // それ以外は動画
    return VideoType.VIDEO
  }

  private calcStartEndTime (video: Video) {
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
      const end = dayjs(video.publishedAt).add(duration, 'second').toDate()
      return {
        start: video.publishedAt,
        end: end
      }
    }

    return { start: undefined, end: undefined }
  }

  private calcMaxViewers (video: Video) {
    const hold = video.maxViewers || 0
    const now = video.concurrentViewers || 0

    return (hold > now) ? hold : now
  }

  /// ////////////////////////////////////////////////////////////

  private _parseStatus (item: object) {
    const privacyStatus: string = get(item, 'status.privacyStatus')

    if (privacyStatus === 'public') {
      return VideoStatus.PUBLIC
    } else if (privacyStatus === 'unlisted') {
      return VideoStatus.UNLISTED
    } else if (privacyStatus === 'private') {
      return VideoStatus.PRIVATE
    }
  }
}
