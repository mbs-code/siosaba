
import {
  EventSubscriber,
  EntitySubscriberInterface, // eslint-disable-line no-unused-vars
  InsertEvent, // eslint-disable-line no-unused-vars
  UpdateEvent, // eslint-disable-line no-unused-vars
  QueryRunner // eslint-disable-line no-unused-vars
} from 'typeorm'

import { cli as Logger } from '../../src/lib/logger'

import { Video } from '../entity/Video'
import { VideoRecord } from './../entity/VideoRecord'
import { VideoStat } from './../entity/VideoStat'

@EventSubscriber()
export class VideoSubscriber implements EntitySubscriberInterface<Video> {
  listenTo () {
    return Video
  }

  async afterInsert (event: InsertEvent<Video>) {
    const qr = event.queryRunner
    const video = event.entity

    // ■ stat に新しい値を追加
    await this.saveStat(qr, video)
  }

  async afterUpdate (event: UpdateEvent<Video>) {
    const qr = event.queryRunner
    const video = event.entity
    const oldVideo = event.databaseEntity

    // 変更カラム名の抽出 (id, createdAt, updatedAt は除外される)
    const changeColumns = event.updatedColumns.map(e => e.propertyName)
    Logger.trace(`> - change: ${JSON.stringify(changeColumns)}`)

    // ■ record に変更点を記録
    await this.saveRecord(qr, video, oldVideo, changeColumns)

    // ■ stat に新しい値を追加
    await this.saveStat(qr, video)
  }

  /// ////////////////////////////////////////////////////////////////////////////////

  private async saveRecord (qr: QueryRunner, video: Video, oldVideo: Video, changeColumns: string[]) {
    const recordColumns = Video.filterOnlyRecordColumns(changeColumns)
    Logger.trace(`> - record: ${JSON.stringify(recordColumns)}`)

    if (recordColumns.length > 0) {
      const record = new VideoRecord()
      record.videoId = video.id
      record.json = {}
      for (const column of changeColumns) {
        record.json[column] = [oldVideo[column], video[column]]
      }

      await qr.manager.save(record)
      Logger.trace(`> - save video_record { id: ${record.id || -1} }`)
      // console.log(record)
      return record
    }

    return null
  }

  private async saveStat (qr: QueryRunner, video: Video) {
    const statColumns = VideoStat.getColumnNames('id', 'videoId', 'createdAt')
    Logger.trace(`> - stat: ${JSON.stringify(statColumns)}`)

    const stat = new VideoStat()
    stat.videoId = video.id
    for (const column of statColumns) {
      stat[column] = video[column]
    }

    await qr.manager.save(stat)
    Logger.trace(`> - save video_stat { id: ${stat.id || -1} }`)
    // console.log(stat)
    return stat
  }
}
