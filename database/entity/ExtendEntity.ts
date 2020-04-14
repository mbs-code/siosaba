import {
  BaseEntity,
  getConnection
} from 'typeorm'

export class ExtendEntity extends BaseEntity {
  static async findOrCreate<T extends typeof ExtendEntity> (this: T, query: object) : Promise<InstanceType<T>> {
    const element = await this.findOne(query)
    return (element || new this()) as InstanceType<T>
  }
  ///

  static RECORD_COLUMNS = []

  /**
   * カラム配列から記録対象を抽出するフィルター.
   * @param {string[]} columnNames カラム配列
   * @return {string[]} column name 配列
   */
  static filterOnlyRecordColumns (columnNames: string[]): string[] {
    const recordColumns = this.RECORD_COLUMNS
    const columns = columnNames
      .filter(s => recordColumns.indexOf(s) !== -1)
    return columns
  }

  /**
   * 自身の column name を取得する.
   * - entity の property name を基準とする (DBではない)
   * @param {string[]} excludes 除外する column name (可変長引数)
   * @return {string[]} column name 配列
   */
  static getColumnNames (...excludes: string[]): string[] {
    const conn = getConnection()
    const columns = conn.getMetadata(this).ownColumns
    const names = columns
      .map(column => column.propertyName)
      .filter(s => excludes.indexOf(s) === -1)
    return names
  }

  /**
   * 自身が保持している column name か確認する.
   * @param {string[]} names 確認する column name (可変長配列)
   * @return {boolean} true で保持している
   */
  static isOwnColumn (...names: string[]): boolean {
    const columns = this.getColumnNames()
    const duplicatedCols = columns.filter(
      item => columns.includes(item) && names.includes(item)
    )
    return duplicatedCols.length > 0
  }
}
