import {
  EventSubscriber,
  EntitySubscriberInterface, // eslint-disable-line no-unused-vars
  InsertEvent, // eslint-disable-line no-unused-vars
  UpdateEvent // eslint-disable-line no-unused-vars
} from 'typeorm'

import { Video } from '../entity/Video'
import { VideoMeta } from '../entity/VideoMeta'

@EventSubscriber()
export class VideoSubscriber implements EntitySubscriberInterface<Video> {
  listenTo () {
    return Video
  }

  async afterInsert (event: InsertEvent<Video>) {
    // console.log('> channel subscriber - after insert')
    const video = event.entity

    // meta の保存
    const meta = video.createVideoMeta()
    await event.queryRunner.manager.save(meta)
    // console.log('>> save video_meta')

    // stat の保存
    const stat = video.createVideoStat()
    await event.queryRunner.manager.save(stat)
    // console.log('>> save video_stat')
  }

  async afterUpdate (event: UpdateEvent<Video>) {
    // console.log('> channel subscriber - after update')
    const video = event.entity
    const changeColumns = event.updatedColumns.map(e => e.propertyName)

    // meta は更新要素があったときだけ
    if (VideoMeta.isOwnColumn(...changeColumns)) {
      const meta = video.createVideoMeta()
      await event.queryRunner.manager.save(meta)
      // console.log('>> save video_meta')
    }

    // stat は常時更新
    const stat = video.createVideoStat()
    await event.queryRunner.manager.save(stat)
    // console.log('>> save video_stat')
  }
}
