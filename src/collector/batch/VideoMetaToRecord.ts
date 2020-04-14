import { cli as Logger } from '../../lib/logger'

import { Video } from '../../../database/entity/Video' // eslint-disable-line no-unused-vars
import { VideoMeta } from '../../../database/entity/VideoMeta'
import { VideoRecord } from '../../../database/entity/VideoRecord'

// !! ChannelMetaToRecord と同一
// !! db:sync をして、record の createdAt を通常カラムにしておくこと
export default async function (videos: Video[]) {
  Logger.info('Start video meta replacer. len: %s', videos.length)
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i]
    Logger.trace('video_id: %s', video.id)

    // meta の取得
    const metas: any = await VideoMeta.find({
      where: { videoId: video.id },
      order: {
        createdAt: 'DESC'
      }
    })

    // 比較用に先頭に video を挿入しておく (処理の対象外)
    metas.unshift(video)

    // 末尾から2つずつ比較していく
    for (let j = metas.length - 1; j > 0; j--) {
      const old = metas[j]
      const now = metas[j - 1]
      await replace(j, video, now, old)
    }

    Logger.debug('[%d/%d] finish: [%s] %s', i + 1, videos.length, video.key, video.title)
  }
  Logger.info('Success!')
}

const replace = async function (index: number, video: Video, now: VideoMeta | Video, old: VideoMeta) {
  const VIDEO_COLUMNS = VideoMeta.getColumnNames('id', 'videoId', 'createdAt')

  Logger.trace('> diff: %d %d', old.id, now.id)

  // 変更があったカラムを抽出
  const changeColumns = []
  for (const col of VIDEO_COLUMNS) {
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
    const record = await VideoRecord.findOrCreate({ videoId: video.id, createdAt: now.createdAt })
    record.videoId = video.id
    record.json = json
    record.createdAt = now.createdAt

    // 保存する
    await record.save()
    Logger.debug('> save record id = %d', record.id)
  } else {
    Logger.debug('> skip')
  }
}
