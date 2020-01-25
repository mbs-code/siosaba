import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm'

import { ExtendEntity } from './ExtendEntity'
import { ChannelMeta } from './ChannelMeta'
import { ChannelStat } from './ChannelStat'

@Entity('channels')
export class Channel extends ExtendEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Index({ unique: true })
  @Column()
  key: string

  @Column()
  title: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ nullable: true })
  thumbnail: string

  @Column({ nullable: true, name: 'thumbnail_hires' })
  thumbnailHires: string

  @Column({ nullable: true })
  playlist: string

  @Column({ type: 'text', nullable: true })
  keyword: string

  @Column({ nullable: true })
  banner: string

  @Column({ nullable: true, name: 'banner_hires' })
  bannerHires: string

  @Column({ nullable: true, name: 'published_at' })
  publishedAt: Date

  @Column({ type: 'int', unsigned: true })
  view: number

  @Column({ type: 'int', unsigned: true })
  comment: number

  @Column({ type: 'int', unsigned: true })
  subscriber: number

  @Column({ type: 'int', unsigned: true })
  video: number

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date

  ///

  @OneToMany(type => ChannelMeta, meta => meta.channel)
  metas: ChannelMeta[]

  @OneToMany(type => ChannelStat, stat => stat.channel)
  stats: ChannelStat[]

  ///

  // TODO: ここに生やしていいのか
  static async findOrCreate (query?: object) {
    const element = await this.findOne(query)
    return element || new this()
  }

  ///

  createChannelMeta () {
    const meta = new ChannelMeta()
    const cols = ChannelMeta.getColumnNames('id', 'channel_id', 'createdAt')
    for (const col of cols) {
      meta[col] = this[col]
    }
    meta.channel = this
    return meta
  }

  createChannelStat () {
    const stat = new ChannelStat()
    const cols = ChannelStat.getColumnNames('id', 'channel_id', 'createdAt')
    for (const col of cols) {
      stat[col] = this[col]
    }
    stat.channel = this
    return stat
  }

  // @BeforeUpdate()
  // async _checkChangeLog () {
  //   console.log('>> before update')
  //   const meta = new ChannelMeta()
  //   await this.change(meta, ['id', 'channel', 'createdAt'])
  //   console.log('>>')

  //   const stat = new ChannelStat()
  //   await this.change(stat, ['id', 'channel', 'createdAt'])
  //   console.log('>> before update after')
  // }

  // async change (tClass: ChannelRelationEntity, tColumns: string[], isForce : boolean = false) {
  //   const columns = tClass.getColumnNames(...tColumns)
  //   const change = this.getChangeValues(columns)

  //   // 変更点があったらログに保存する
  //   if (isForce || Object.keys(change).length) {
  //     for (const col of columns) {
  //       tClass[col] = this[col]
  //     }
  //     tClass.channelId = this.id
  //     await tClass.save()
  //   }
  // }
}
