export default abstract class Collector {

  async exec (ids?: string[]) {
    const values = []

    // 各IDごとに処理
    for (const id of ids) {
      console.log(`> run: ${id}`)
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
    }

    // フィルタリング (重複、空要素を削除)
    const filterValues = values.filter((val, index, array) => {
      return val && array.indexOf(val) === index
    })

    console.log(`collect: ${filterValues.length}`)
    return filterValues
  }

  protected abstract async fetch(id: string) : Promise<object[]>

  protected abstract async parse(item: object) : Promise<string>
}
