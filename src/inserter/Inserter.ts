import { get } from 'dot-prop'
import * as chunk from 'chunk'

import * as dayjs from 'dayjs'
import { parse as parseDuration, toSeconds } from 'iso8601-duration'

import { cli as Logger } from '../lib/logger'

import { ExtendEntity } from '../../database/entity/ExtendEntity' // eslint-disable-line no-unused-vars
import dataMapping from '../lib/dataMapping'

export default abstract class Inserter<T extends ExtendEntity> {
  // 一度に処理する上限量
  protected limit:number = 50

  async exec (param: { ids?: string[] }) {
    Logger.debug('start <%s>', this.constructor.name)

    const keys = param.ids
    const chunks = chunk(keys, this.limit)

    const items = []
    let idx = 0
    for (const chunk of chunks) {
      Logger.trace('[%d/%d]', idx + 1, chunks.length)
      const ret = await this.loop(chunk)
      items.push(...ret)

      idx++
    }

    Logger.debug('finish <%s>', this.constructor.name)
  }

  private async loop (chunk: string[]): Promise<any> {
    // data fetch
    const items = await this.fetch(chunk)
    Logger.trace('- fetch: %d items', items.length)

    // データマッピング (ID削除対策)
    const map = dataMapping(chunk, items, (item) => {
      return get(item, 'id')
    })

    // 各値ごとに パースして保存する
    let idx = 0
    for (const key of chunk) {
      try {
        const item = map[key]
        if (item) {
          await this.insert(key, map[key])
          const title = get(item, 'snippet.title')
          Logger.trace('- save: [%s] %s', key, title)
        } else {
          await this.delete(key, map[key])
          const title = get(item, 'snippet.title')
          Logger.trace('- del: [%s] %s', key, title)
        }
      } catch (e) {
        const item = map[key]
        const title = get(item, 'snippet.title')
        Logger.trace('- error: [%s] %s', key, title)
      }

      idx++
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
