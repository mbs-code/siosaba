import { get } from 'dot-prop'

import * as dayjs from 'dayjs'
import { parse as parseDuration, toSeconds } from 'iso8601-duration'

import { ExtendEntity } from '../../database/entity/ExtendEntity' // eslint-disable-line no-unused-vars

export default abstract class Inserter<T extends ExtendEntity> {
  key: string
  item: object

  constructor (item: object) {
    const key: string = get(item, 'id')
    if (!key) {
      throw new Error('Key is not defined.')
    }

    this.key = key
    this.item = item
  }

  async exec () {
    const insert = await this.insert(this.item)
  }

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
