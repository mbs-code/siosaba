import { get } from 'dot-prop'

import * as dayjs from 'dayjs'
import { parse as parseDuration, toSeconds } from 'iso8601-duration'

import { ExtendEntity } from '../../database/entity/ExtendEntity' // eslint-disable-line no-unused-vars
import dataMapping from '../lib/dataMapping'

export default abstract class Inserter<T extends ExtendEntity> {
  async exec (param: { ids?: string[] }) {
    const keys = param.ids

    // data fetch
    const items = await this.fetch(keys)
    console.log(`fetch: ${items.length}`)

    // データマッピング (ID削除対策)
    const map = dataMapping(keys, items, (item) => {
      return get(item, 'id')
    })

    // 各値ごとに パースして保存する
    for (const key of keys) {
      try {
        const item = map[key]
        if (item) {
          await this.insert(key, map[key])
          const title = get(item, 'snippet.title')
          console.log(`save - [${key}] ${title}`)
        } else {
          await this.delete(key, map[key])
          const title = get(item, 'snippet.title')
          console.log(`del - [${key}] ${title}`)
        }
      } catch (e) {
        const item = map[key]
        const title = get(item, 'snippet.title')
        console.log(`error - [${key}] ${title}`)
      }
    }
  }

  protected abstract async fetch (ids: string[]) : Promise<object[]>

  protected abstract async insert (key: string, item: object) : Promise<T>

  protected abstract async delete (key: string, item: object) : Promise<T|any>

  ///

  private static readonly THUMBNAIL_TYPES = ['maxres', 'standard', 'high', 'medium', 'default']

  protected extractHiresThumbnail = function (thumbnails: Object) {
    if (thumbnails) {
      for (const type of this.constructor.THUMBNAIL_TYPES) {
        const thumb: string = get(thumbnails, `${type}.url`)
        if (thumb) {
          return thumb
        }
      }
    }
    return undefined
  }

  protected parseDatetime = function (iso8601Datetime?: string) {
    if (iso8601Datetime) {
      const day = dayjs(iso8601Datetime).toDate()
      return day
    }
  }

  protected parseDuration = function (iso8601Duration?: string) {
    if (iso8601Duration) {
      const parse = parseDuration(iso8601Duration)
      return toSeconds(parse)
    }

    // TODO: 現在時刻比で計算する？
    return 0
  }
}
