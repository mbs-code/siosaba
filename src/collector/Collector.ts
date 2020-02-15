import { filterSeries } from 'p-iteration'

import { cli as Logger } from '../lib/logger'

export default abstract class Collector {
  async exec (ids?: string[]) {
    Logger.debug('<%s> start', this.constructor.name)

    const items = []
    if (Array.isArray(ids) && ids.length) {
      // 配列なら 各IDごとに処理
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i]

        Logger.trace('[%d/%d] id: %s', i + 1, ids.length, id)
        const ret = await this.loop(id)
        items.push(...ret)
      }
    } else {
      // それ以外なら 一回だけ実行しとく (空実行用)
      // 不必要なら fetch で throw する
      const ret = await this.loop()
      items.push(...ret)
    }
    Logger.debug('collect %d items', items.length)

    // フィルタリング (重複、空要素を削除)
    const filterItems = await filterSeries(items, async (val, index, array) => {
      const filter = this.filter(val)
      return val && array.indexOf(val) === index && filter
    })
    Logger.debug('filtered %d items', filterItems.length)

    Logger.debug('<%s> finish', this.constructor.name)
    return filterItems
  }

  private async loop (id?: string): Promise<any[]> {
    // data fetch
    const items = await this.fetch(id)
    Logger.trace('- fetch: %d items', items.length)

    // パースして保存する
    const parseItems = []
    for (const item of items) {
      const key = await this.parse(item)
      if (key) {
        parseItems.push(key)
      }
    }

    Logger.trace('- parse: %d items', parseItems.length)
    return parseItems
  }

  protected abstract async fetch (id?: string) : Promise<object[]>

  protected abstract async parse (item: object) : Promise<string>

  protected async filter (key: string) : Promise<boolean> {
    // do override!
    return true
  }
}
