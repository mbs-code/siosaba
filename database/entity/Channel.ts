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
import { ChannelRecord } from './ChannelRecord'
import { ChannelStat } from './ChannelStat'
import { Video } from './Video'

@Entity('channels')
export class Channel extends ExtendEntity {
  static RECORD_COLUMNS = ['key', 'title', 'description', 'thumbnail', 'thumbnailHires',
    'playlist', 'tags', 'banner', 'bannerHires', 'publishedAt'
  ]

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

  @OneToMany(type => ChannelRecord, record => record.channel)
  records: ChannelRecord[]

  @OneToMany(type => ChannelStat, stat => stat.channel)
  stats: ChannelStat[]
}
