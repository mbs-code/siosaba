import {
  MoreThanOrEqual,
  LessThan,
  ObjectLiteral, // eslint-disable-line no-unused-vars
  FindManyOptions // eslint-disable-line no-unused-vars
} from 'typeorm'

import dayjs from 'dayjs'

import { ExtendEntity } from './../../database/entity/ExtendEntity' // eslint-disable-line no-unused-vars

export default class SearchOptionBuilder<T = any> {
  query: ObjectLiteral
  options: FindManyOptions<T>

  static builder<T> (query: ObjectLiteral) {
    return new this<T>(query)
  }

  constructor (query: ObjectLiteral) {
    this.query = query
    this.options = {
      order: {},
      where: {}
    }
  }

  build () {
    return this.options
  }

  /// ////////////////////////////////////////////////////////////

  enum (queryKey: string, enumObject: Object, columnName?: string) {
    const value = this.query[queryKey]
    const column = columnName || queryKey
    if (value) {
      if (!(Object.values(enumObject) as string[]).includes(value)) {
        throw new Error(`"${queryKey}" is not valid. { input: "${value}", allow: ${JSON.stringify(Object.values(enumObject))} }`)
      }

      this.options.where[column] = value
    }
    return this
  }

  /**
   * 指定した時刻より前のものを取得する.
   * <--------------┐
   *  entity |-->   │
   * ---------------○-----
   *             queryKey
   */
  untilDatetime (queryKey: string, columnName?: string) {
    const value = this.query[queryKey]
    const column = columnName || queryKey
    if (value) {
      const end = dayjs(value)
      if (!end.isValid()) {
        throw new Error(`"${queryKey}" is not valid. { input :"${value}", allow: "iso8601 datetime format" }`)
      }
      this.options.where[column] = LessThan(end.toDate()) // <
    }
    return this
  }

  /**
   * 指定した時刻より後のものを取得する.
   *     ┌------------->
   *     │  <--| entity
   * ----●--------------
   *  queryKey
   */
  sinceDatetime (queryKey: string, startColumnName?: string) {
    const value = this.query[queryKey]
    const column = startColumnName || queryKey
    if (value) {
      const start = dayjs(value)
      if (!start.isValid()) {
        throw new Error(`"${queryKey}" is not valid. { input :"${value}", allow: "iso8601 datetime format" }`)
      }
      this.options.where[column] = MoreThanOrEqual(start.toDate()) // >=
    }
    return this
  }

  pagination () {
    const page: number = this.query.page || 1
    const size: number = this.query.size || 20
    const sort: string = this.query.sort
    const order: 'ASC'|'DESC'|'-1'|'1' = this.query.order || 'ASC'

    const cPage = this.range(page, { min: 1 })
    const cSize = this.range(size, { max: 100 })

    this.options.take = cSize
    this.options.skip = (cPage - 1) * cSize

    if (sort) {
      this.options.order[sort] = this.formatOrder(order)
    }
    return this
  }

  raw (callback: (options: FindManyOptions<T>) => FindManyOptions<T>) {
    this.options = callback(this.options)
    return this
  }

  /// ////////////////////////////////////////////////////////////

  private range (num: number, { min, max }: { min?: number, max?: number } = {}) {
    if (num) {
      if (max !== null && num > max) {
        return max
      } else if (min !== null && num < min) {
        return min
      }
    }
    return num
  }

  private formatOrder (val: string) {
    if (val) {
      if (!isNaN(Number(val))) { // 数字以外は true
        return parseInt(val)
      }
      return val.toUpperCase()
    }
    return val
  }
}
