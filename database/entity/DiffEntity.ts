import {
  BaseEntity,
  AfterLoad,
  getConnection,
  AfterInsert,
  AfterUpdate,
  AfterRemove
} from 'typeorm'

export class DiffEntity extends BaseEntity {
  private _raw?: Object = undefined

  getChangeValues () {
    if (this._raw) {
      const keys = Object.keys(this._raw)

      const obj = {}
      for (const key of keys) {
        const nowVal = this[key]
        const rawVal = this._raw[key]
        if (nowVal !== rawVal) {
          obj[key] = { before: rawVal, after: nowVal }
        }
      }
      return obj
    }
    return undefined
  }

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  @AfterRemove()
  _pickupRawColumns () {
    const conn = getConnection()
    const columns = conn.getMetadata(this.constructor).ownColumns
    const array = columns.map(column => [column.propertyName, this[column.propertyName]])

    this._raw = array.reduce((obj, [key, val]) => {
      obj[key] = val
      return obj
    }, {})
  }
}
