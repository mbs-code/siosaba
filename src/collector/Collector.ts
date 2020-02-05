export default abstract class Collector {
  async exec (ids?: string[]) {
    const values = []

    if (ids) {
      // 配列各IDごとに処理
      for (const id of ids) {
        const ret = await this.loop(id)
        values.push(ret)
      }
    } else {
      // それ以外なら一回だけ実行しとく (空実行用)
      // 不必要なら fetch で throw する
      const ret = await this.loop()
      values.push(ret)
    }

    // フィルタリング (重複、空要素を削除)
    const filterValues = values.filter((val, index, array) => {
      return val && array.indexOf(val) === index
    })

    console.log(`> collect: ${filterValues.length}`)
    return filterValues
  }

  private async loop (id?: string) {
    console.log(`> run: ${id}`)
    const values = []

    // data fetch
    const items = await this.fetch(id)
    console.log(`fetch: ${items.length}`)

    // パースして保存する
    for (const item of items) {
      const parse = await this.parse(item)
      if (parse) {
        values.push(parse)
      }
    }

    return values
  }

  protected abstract async fetch(id?: string) : Promise<object[]>

  protected abstract async parse(item: object) : Promise<string>
}
