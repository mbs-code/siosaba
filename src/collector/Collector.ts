import { filterSeries } from 'p-iteration'

export default abstract class Collector {
  async exec (ids?: string[]) {
    const values = []

    if (Array.isArray(ids)) {
      // 配列各IDごとに処理
      for (const id of ids) {
        const ret = await this.loop(id)
        values.push(...ret)
      }
    } else {
      // それ以外なら一回だけ実行しとく (空実行用)
      // 不必要なら fetch で throw する
      const ret = await this.loop()
      values.push(...ret)
    }

    // フィルタリング (重複、空要素を削除)
    const filterValues = await filterSeries(values, async (val, index, array) => {
      const filter = this.filter(val)
      return val && array.indexOf(val) === index && filter
    })

    console.log(filterValues)
    console.log(`> collect: ${filterValues.length}`)
    return filterValues
  }

  private async loop (id?: string): Promise<any[]> {
    console.log(`> run: ${id}`)
    const values = []

    // data fetch
    const items = await this.fetch(id)
    console.log(`fetch: ${items.length}`)

    // パースして保存する
    for (const item of items) {
      const key = await this.parse(item)
      if (key) {
        values.push(key)
      }
    }

    return values
  }

  protected abstract async fetch (id?: string) : Promise<object[]>

  protected abstract async parse (item: object) : Promise<string>

  protected async filter (key: string) : Promise<boolean> {
    // do override!
    return true
  }
}
