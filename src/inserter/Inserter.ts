import { get } from 'dot-prop'
import chunk from 'chunk'
import truncate from 'cli-truncate'

import dayjs from 'dayjs'
import { parse as parseDuration, toSeconds } from 'iso8601-duration'

import { cli as Logger } from '../lib/logger'

import { ExtendEntity } from '../../database/entity/ExtendEntity' // eslint-disable-line no-unused-vars
import dataMapping from '../lib/dataMapping'

export default abstract class Inserter<T extends ExtendEntity> {
  // 一度に処理する上限量
  protected limit:number = 50

  async exec (param: { ids?: string[] }) {
    Logger.debug('<%s> start', this.constructor.name)

    const keys = param.ids
    const chunks = chunk(keys, this.limit)

    const items = []
    let idx = 0
    for (const chunk of chunks) {
      Logger.trace('[%d/%d] %d items %s', idx + 1, chunks.length, chunk.length, truncate(JSON.stringify(chunk), 32))

      const ret = await this.loop(chunk)
      items.push(...ret)

      Logger.trace('[%d/%d] { all: %d, success: %d, throw: %d }', idx + 1, chunks.length,
        chunk.length, ret.length, chunk.length - ret.length)
      idx++
    }

    Logger.debug('<%s> finish', this.constructor.name)
    return items
  }

  private async loop (chunk: string[]): Promise<any> {
    // data fetch
    const items = await this.fetch(chunk)
    Logger.trace('> fetch: %d items', items.length)

    // データマッピング (ID削除対策)
    const map = dataMapping(chunk, items, (item) => {
      return get(item, 'id')
    })

    // 各値ごとに パースして保存する
    const values = []
    let idx = 0
    for (const key of chunk) {
      Logger.trace('> [%d/%d] id: %s', idx + 1, chunk.length, key)

      try {
        const item = map[key]
        if (item) {
          const ret = await this.insert(key, map[key])
          values.push(ret)
          const title = get(item, 'snippet.title')
          Logger.debug('> [%d/%d] save: [%s] %s', idx + 1, chunk.length, key, title)
        } else {
          const ret = await this.delete(key, map[key])
          values.push(ret)
          const title = get(item, 'snippet.title')
          Logger.debug('> [%d/%d] del: [%s] %s', idx + 1, chunk.length, key, title)
        }
      } catch (e) {
        const item = map[key]
        const title = get(item, 'snippet.title')
        Logger.warn('> [%d/%d] error: [%s] %s', idx + 1, chunk.length, key, title)
        Logger.warn(e)
      }

      idx++
    }

    return values
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
