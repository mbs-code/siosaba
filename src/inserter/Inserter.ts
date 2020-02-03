import { get } from 'dot-prop'

import * as dayjs from 'dayjs'
import { parse as parseDuration, toSeconds } from 'iso8601-duration'

import { ExtendEntity } from '../../database/entity/ExtendEntity' // eslint-disable-line no-unused-vars

export default abstract class Inserter<T extends ExtendEntity> {
  async exec (param: { ids?: string[] }) {
    const items = await this.fetch(param.ids)
    for (const item of items) {
      try {
        const insert = await this.insert(item)
      } catch (e) {
        const key = get(item, 'id')
        const title = get(item, 'snippet.title')
        console.log(`error - [${key}] ${title}`)
      }
    }
  }

  protected abstract async fetch(ids: string[]) : Promise<object[]>

  protected abstract async insert(item: object) : Promise<T>

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
