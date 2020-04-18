import ChannelCollector from '../ChannelCollector'

export default class ChannelQueryBuilder {
  static builder () {
    return new this()
  }

  async exec () {
    const cc = new ChannelCollector()
    const val = await cc.exec()
    return val
  }

  // NOTE: 特に抽出する内容が無い
}
