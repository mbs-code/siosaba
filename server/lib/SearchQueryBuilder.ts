import {
  SelectQueryBuilder, // eslint-disable-line no-unused-vars
  ObjectLiteral, // eslint-disable-line no-unused-vars
  BaseEntity,
  Brackets
} from 'typeorm'

import dayjs from 'dayjs'
import { snakeCase } from 'snake-case'
import normalizeArray from './normalizeArray'

export default class SearchOptionBuilder {
  query: ObjectLiteral
  qb: SelectQueryBuilder<BaseEntity>
  alias: string

  page: number
  take: number

  static builder (query: ObjectLiteral, entity: typeof BaseEntity, alias: string) {
    return new this(query, entity, alias)
  }

  constructor (query: ObjectLiteral, entity: typeof BaseEntity, alias: string) {
    this.query = query
    this.alias = alias
    this.page = 1
    this.take = 20
    this.qb = entity.createQueryBuilder().take(this.limit) // take 指定忘れのために初期値を指定
  }

  build () {
    return {
      query: this.qb,
      page: this.page,
      size: this.take
    }
  }

  /// ////////////////////////////////////////////////////////////

  search (queryKey: string, columnNames: string[]) {
    const value = this.query[queryKey]
    const columns = columnNames
    if (value) {
      this.qb.andWhere(new Brackets(qb => {
        for (const column of columns) {
          const fCol = snakeCase(column)
          qb.orWhere(`${this.alias}.${fCol} LIKE :${fCol}`, { [fCol]: `%${value}%` })
        }
      }))
    }
    return this
  }

  enum (queryKey: string, enumObject: Object, columnName?: string) {
    const column = snakeCase(columnName || queryKey)
    const values = normalizeArray(this.query[queryKey + '[]'] || this.query[queryKey])

    if (values) {
      for (const value of values) {
        if (!(Object.values(enumObject) as string[]).includes(value)) {
          throw new Error(`"${queryKey}" is not valid. { input: "${value}", allow: ${JSON.stringify(Object.values(enumObject))} }`)
        }
      }
      this.qb.andWhere(`${this.alias}.${column}  IN (:${column})`, { [column]: values })
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
  untilDatetime (queryKey: string, endColumnName?: string) {
    const value = this.query[queryKey]
    const column = snakeCase(endColumnName || queryKey)
    if (value) {
      const end = dayjs(value)
      if (!end.isValid()) {
        throw new Error(`"${queryKey}" is not valid. { input :"${value}", allow: "iso8601 datetime format" }`)
      }
      this.qb.andWhere(`${this.alias}.${column} < :${column}`, { [column]: value })
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
    const column = snakeCase(startColumnName || queryKey)
    if (value) {
      const start = dayjs(value)
      if (!start.isValid()) {
        throw new Error(`"${queryKey}" is not valid. { input :"${value}", allow: "iso8601 datetime format" }`)
      }
      this.qb.andWhere(`${this.alias}.${column} >= :${column}`, { [column]: value })
    }
    return this
  }

  pagination ({ pageQueryKey = 'page', sizeQueryKey = 'size', sortQueryKey = 'sort', orderQueryKey = 'order' }
    : { pageQueryKey?: string, sizeQueryKey?: string, sortQueryKey?: string, orderQueryKey?: string } = {}) {
    const page: number = this.query[pageQueryKey] || 1
    const size: number = this.query[sizeQueryKey] || 20
    const sort: string = this.query[sortQueryKey]
    const order: string = this.query[orderQueryKey] || 'ASC'

    const cPage = this.range(page, { min: 1 })
    const cSize = this.range(size, { max: 100 })

    this.qb.take(cSize)
    this.qb.skip((cPage - 1) * cSize)

    if (sort) {
      const fSort = snakeCase(sort)
      const fOrder: 'ASC'|'DESC' = this.formatOrder(order)
      this.qb.orderBy(`${this.alias}.${fSort}`, fOrder)
    }

    this.take = cSize
    this.page = page

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

  private formatOrder (val: string): 'ASC'|'DESC' {
    if (val) {
      if (!isNaN(Number(val))) { // 数字以外は true
        if (parseInt(val) >= 0) {
          return 'ASC'
        } else {
          return 'DESC'
        }
      }

      const upper = val.toUpperCase()
      if (upper === 'ASC' || upper === 'DESC') {
        return upper
      }
    }

    return 'ASC' // default
  }
}
