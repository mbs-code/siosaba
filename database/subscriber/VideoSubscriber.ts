import {
  EventSubscriber,
  EntitySubscriberInterface, // eslint-disable-line no-unused-vars
  InsertEvent, // eslint-disable-line no-unused-vars
  UpdateEvent // eslint-disable-line no-unused-vars
} from 'typeorm'

import { cli as Logger } from '../../src/lib/logger'

import { Video } from '../entity/Video'
import { VideoMeta } from '../entity/VideoMeta'

@EventSubscriber()
export class VideoSubscriber implements EntitySubscriberInterface<Video> {
  listenTo () {
    return Video
  }

  async afterInsert (event: InsertEvent<Video>) {
    const video = event.entity

    // meta の保存
    const meta = video.createVideoMeta()
    await event.queryRunner.manager.save(meta)
    Logger.trace(`> save video_meta { id: ${meta.id} }`)

    // stat の保存
    const stat = video.createVideoStat()
    await event.queryRunner.manager.save(stat)
    Logger.trace(`> save video_stat { id: ${stat.id} }`)
  }

  async afterUpdate (event: UpdateEvent<Video>) {
    const video = event.entity
    const changeColumns = event.updatedColumns.map(e => e.propertyName)
    Logger.trace(`> change: ${JSON.stringify(changeColumns)}`)

    // meta は更新要素があったときだけ
    if (VideoMeta.isOwnColumn(...changeColumns)) {
      const meta = video.createVideoMeta()
      await event.queryRunner.manager.save(meta)
      Logger.trace(`> save video_meta { id: ${meta.id} }`)
    }

    // stat は常時更新
    const stat = video.createVideoStat()
    await event.queryRunner.manager.save(stat)
    Logger.trace(`> save video_stat { id: ${stat.id} }`)
  }
}
