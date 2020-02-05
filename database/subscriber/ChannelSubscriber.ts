import {
  EventSubscriber,
  EntitySubscriberInterface, // eslint-disable-line no-unused-vars
  InsertEvent, // eslint-disable-line no-unused-vars
  UpdateEvent // eslint-disable-line no-unused-vars
} from 'typeorm'

import { Channel } from '../entity/Channel'
import { ChannelMeta } from '../entity/ChannelMeta'

@EventSubscriber()
export class ChannelSubscriber implements EntitySubscriberInterface<Channel> {
  listenTo () {
    return Channel
  }

  async afterInsert (event: InsertEvent<Channel>) {
    // console.log('> channel subscriber - after insert')

    const channel = event.entity

    // meta の保存
    const meta = channel.createChannelMeta()
    await event.queryRunner.manager.save(meta)
    // console.log('>> save channel_meta')

    // stat の保存
    const stat = channel.createChannelStat()
    await event.queryRunner.manager.save(stat)
    // console.log('>> save channel_stat')
  }

  async afterUpdate (event: UpdateEvent<Channel>) {
    // console.log('> channel subscriber - after update')
    const channel = event.entity
    const changeColumns = event.updatedColumns.map(e => e.propertyName)

    // meta は更新要素があったときだけ
    if (ChannelMeta.isOwnColumn(...changeColumns)) {
      const meta = channel.createChannelMeta()
      await event.queryRunner.manager.save(meta)
      // console.log('>> save channel_meta')
    }

    // stat は常時更新
    const stat = channel.createChannelStat()
    await event.queryRunner.manager.save(stat)
    // console.log('>> save channel_stat')
  }
}
