import { cli as Logger } from '../../lib/logger'

import { Channel } from '../../../database/entity/Channel' // eslint-disable-line no-unused-vars
import { ChannelMeta } from '../../../database/entity/ChannelMeta'
import { ChannelRecord } from '../../../database/entity/ChannelRecord'

// !! VideoMetaToRecord と同一
// !! db:sync をして、record の createdAt を通常カラムにしておくこと
export default async function (channels: Channel[]) {
  Logger.info('Start channel meta replacer. len: %s', channels.length)
  for (let i = 0; i < channels.length; i++) {
    const channel = channels[i]
    Logger.trace('channel_id: %s', channel.id)

    // meta の取得
    const metas: any = await ChannelMeta.find({
      where: { channelId: channel.id },
      order: {
        createdAt: 'DESC'
      }
    })

    // 比較用に先頭に channel を挿入しておく (処理の対象外)
    metas.unshift(channel)

    // 末尾から2つずつ比較していく
    for (let j = metas.length - 1; j > 0; j--) {
      const old = metas[j]
      const now = metas[j - 1]
      await replace(j, channel, now, old)
    }

    Logger.debug('[%d/%d] finish: [%s] %s', i + 1, channels.length, channel.key, channel.title)
  }
  Logger.info('Success!')
}

const replace = async function (index: number, channel: Channel, now: ChannelMeta | Channel, old: ChannelMeta) {
  const CHANNEL_COLUMNS = ChannelMeta.getColumnNames('id', 'channelId', 'createdAt')

  Logger.trace('> diff: %d %d', old.id, now.id)

  // 変更があったカラムを抽出
  const changeColumns = []
  for (const col of CHANNEL_COLUMNS) {
    const oo = old[col]
    const nn = now[col]

    if (oo && oo.getTime && nn && nn.getTime) {
      // date 比較
      // console.log(`${col}: date diff ${oo.getTime() !== nn.getTime()}`)
      if (oo.getTime() !== nn.getTime()) {
        changeColumns.push(col)
      }
    } else if (oo && Array.isArray(oo) && nn && Array.isArray(nn)) {
      // array 比較
      const oDiffs = oo.filter(e => nn.indexOf(e) === -1)
      const nDiffs = nn.filter(e => oo.indexOf(e) === -1)
      // console.log(`${col}: array diff ${oDiffs.length || nDiffs.length}`)
      if (oDiffs.length || nDiffs.length) {
        changeColumns.push(col)
      }
    } else if (old[col] !== now[col]) {
      // console.log(`${col}: diff ${old[col] !== now[col]}`)
      changeColumns.push(col)
    } else {
      // console.log(`${col}: no diff`)
    }
  }

  Logger.trace('> changeColumns: %s', changeColumns)

  if (changeColumns.length > 0) {
    const json: any = {}
    for (const column of changeColumns) {
      json[column] = [old[column], now[column]]
    }

    // 一つでも変更点があるならレコードを作成する
    // foc で上書き防止 ( createdAt が被ることはないだろという慢心)
    const record = await ChannelRecord.findOrCreate({ channelId: channel.id, createdAt: now.createdAt })
    record.channelId = channel.id
    record.json = json
    record.createdAt = now.createdAt

    // 保存する
    await record.save()
    // console.log(record)
    Logger.debug('> save record id = %d', record.id || 0)
  } else {
    Logger.debug('> skip')
  }
}
