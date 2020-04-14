import {
  EventSubscriber,
  EntitySubscriberInterface, // eslint-disable-line no-unused-vars
  InsertEvent, // eslint-disable-line no-unused-vars
  UpdateEvent, // eslint-disable-line no-unused-vars
  QueryRunner // eslint-disable-line no-unused-vars
} from 'typeorm'

import { cli as Logger } from '../../src/lib/logger'

import { Channel } from '../entity/Channel'
import { ChannelRecord } from './../entity/ChannelRecord'
import { ChannelStat } from './../entity/ChannelStat'

@EventSubscriber()
export class ChannelSubscriber implements EntitySubscriberInterface<Channel> {
  listenTo () {
    return Channel
  }

  async afterInsert (event: InsertEvent<Channel>) {
    const qr = event.queryRunner
    const channel = event.entity

    // ■ stat に新しい値を追加
    await this.saveStat(qr, channel)
  }

  async afterUpdate (event: UpdateEvent<Channel>) {
    const qr = event.queryRunner
    const channel = event.entity
    const oldChannel = event.databaseEntity

    // 変更カラム名の抽出 (id, createdAt, updatedAt は除外される)
    const changeColumns = event.updatedColumns.map(e => e.propertyName) // id, createdAt, updatedAt は除外される
    Logger.trace(`> - change: ${JSON.stringify(changeColumns)}`)

    // ■ record に変更点を記録
    await this.saveRecord(qr, channel, oldChannel, changeColumns)

    // ■ stat に新しい値を追加
    await this.saveStat(qr, channel)
  }

  /// ////////////////////////////////////////////////////////////////////////////////

  private async saveRecord (qr: QueryRunner, channel: Channel, oldChannel: Channel, changeColumns: string[]) {
    const recordColumns = Channel.filterOnlyRecordColumns(changeColumns)
    Logger.trace(`> - record: ${JSON.stringify(recordColumns)}`)

    if (recordColumns.length > 0) {
      const record = new ChannelRecord()
      record.channelId = channel.id
      record.json = {}
      for (const column of changeColumns) {
        record.json[column] = [oldChannel[column], channel[column]]
      }

      await qr.manager.save(record)
      Logger.trace(`> - save channel_record { id: ${record.id || -1} }`)
      // console.log(record)
      return record
    }

    return null
  }

  private async saveStat (qr: QueryRunner, channel: Channel) {
    const statColumns = ChannelStat.getColumnNames('id', 'channelId', 'createdAt')
    Logger.trace(`> - stat: ${JSON.stringify(statColumns)}`)

    const stat = new ChannelStat()
    stat.channelId = channel.id
    for (const column of statColumns) {
      stat[column] = channel[column]
    }

    await qr.manager.save(stat)
    Logger.trace(`> - save channel_stat { id: ${stat.id || -1} }`)
    // console.log(stat)
    return stat
  }
}
