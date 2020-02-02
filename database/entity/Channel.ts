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
import { Video } from './Video'

@Entity('channels')
export class Channel extends ExtendEntity {
  static async findOrCreate (query?: object) {
    const element = await this.findOne(query)
    return element || new this()
  }

  ///

  @PrimaryGeneratedColumn()
  id: number

  ///
  // ChannelMeta

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

  @Column({ type: 'simple-array', nullable: true })
  tags: string[] // csv

  @Column({ nullable: true })
  banner: string

  @Column({ nullable: true, name: 'banner_hires' })
  bannerHires: string

  @Column({ type: 'datetime', precision: 3, nullable: true, name: 'published_at' })
  publishedAt: Date

  ///
  // ChannelStat

  @Column({ type: 'int', unsigned: true })
  view: number

  @Column({ type: 'int', unsigned: true })
  comment: number

  @Column({ type: 'int', unsigned: true })
  subscriber: number

  @Column({ type: 'int', unsigned: true })
  video: number

  ///

  @CreateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)', name: 'updated_at' })
  updatedAt: Date

  ///

  @OneToMany(type => Video, video => video.channel)
  videos: Video[]

  @OneToMany(type => ChannelMeta, meta => meta.channel)
  metas: ChannelMeta[]

  @OneToMany(type => ChannelStat, stat => stat.channel)
  stats: ChannelStat[]

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
}
