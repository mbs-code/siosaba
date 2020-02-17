import {
  EventSubscriber,
  EntitySubscriberInterface, // eslint-disable-line no-unused-vars
  InsertEvent, // eslint-disable-line no-unused-vars
  UpdateEvent // eslint-disable-line no-unused-vars
} from 'typeorm'

import { cli as Logger } from '../../src/lib/logger'

import { Channel } from '../entity/Channel'
import { ChannelMeta } from '../entity/ChannelMeta'

@EventSubscriber()
export class ChannelSubscriber implements EntitySubscriberInterface<Channel> {
  listenTo () {
    return Channel
  }

  async afterInsert (event: InsertEvent<Channel>) {
    const channel = event.entity

    // meta の保存
    const meta = channel.createChannelMeta()
    await event.queryRunner.manager.save(meta)
    Logger.trace(`> - save channel_meta { id: ${meta.id} }`)

    // stat の保存
    const stat = channel.createChannelStat()
    await event.queryRunner.manager.save(stat)
    Logger.trace(`> - save channel_stat { id: ${stat.id} }`)
  }

  async afterUpdate (event: UpdateEvent<Channel>) {
    const channel = event.entity
    const changeColumns = event.updatedColumns.map(e => e.propertyName)
    Logger.trace(`> - change: ${JSON.stringify(changeColumns)}`)

    // meta は更新要素があったときだけ
    if (ChannelMeta.isOwnColumn(...changeColumns)) {
      const meta = channel.createChannelMeta()
      await event.queryRunner.manager.save(meta)
      Logger.trace(`> - save channel_meta { id: ${meta.id} }`)
    }

    // stat は常時更新
    const stat = channel.createChannelStat()
    await event.queryRunner.manager.save(stat)
    Logger.trace(`> - save channel_stat { id: ${stat.id} }`)
  }
}
