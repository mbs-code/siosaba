import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm'

import { ExtendEntity } from './ExtendEntity'
import { Channel } from './Channel'
import { VideoMeta } from './VideoMeta'
import { VideoStat } from './VideoStat'
import { VideoType } from './type/VideoType'
import { VideoStatus } from './type/VideoStatus'

@Entity('videos')
export class Video extends ExtendEntity {
  static async findOrCreate (query?: object) {
    const element = await this.findOne(query)
    return element || new this()
  }

  ///

  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true, name: 'channel_id' })
  channelId: number // DB に無いものも入れれるようにしておいた(後から整合性を保つ)

  ///
  // VideoMeta
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

  @Column({ type: 'enum', enum: VideoType, nullable: true })
  type: VideoType

  @Column({ type: 'enum', enum: VideoStatus, nullable: true })
  status: VideoStatus

  @Column({ type: 'int', unsigned: true, nullable: true })
  duration: number

  @Column({ type: 'datetime', precision: 3, nullable: true, name: 'start_time' })
  startTime: Date // DB 抽出用

  @Column({ type: 'datetime', precision: 3, nullable: true, name: 'end_time' })
  endTime: Date // DB 抽出用

  @Column({ type: 'datetime', precision: 3, nullable: true, name: 'scheduled_start_time' })
  scheduledStartTime: Date

  @Column({ type: 'datetime', precision: 3, nullable: true, name: 'scheduled_end_time' })
  scheduledEndTime: Date

  @Column({ type: 'datetime', precision: 3, nullable: true, name: 'actual_start_time' })
  actualStartTime: Date

  @Column({ type: 'datetime', precision: 3, nullable: true, name: 'actual_end_time' })
  actualEndTime: Date

  @Column({ type: 'simple-array', nullable: true })
  tags: string[] // csv

  @Column({ nullable: true, name: 'live_chat_key' })
  liveChatKey: string

  @Column({ type: 'datetime', precision: 3, nullable: true, name: 'published_at' })
  publishedAt: Date

  ///
  // VideoStat

  @Column({ type: 'int', unsigned: true, nullable: true })
  view: number

  @Column({ type: 'int', unsigned: true, nullable: true })
  like: number

  @Column({ type: 'int', unsigned: true, nullable: true })
  dislike: number

  @Column({ type: 'int', unsigned: true, nullable: true })
  favorite: number

  @Column({ type: 'int', unsigned: true, nullable: true })
  comment: number

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'concurrent_viewers' })
  concurrentViewers: number

  ///

  @CreateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)', name: 'updated_at' })
  updatedAt: Date

  ///

  @ManyToOne(type => Channel, channel => channel.videos)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel

  @OneToMany(type => VideoMeta, meta => meta.video)
  metas: VideoMeta[]

  @OneToMany(type => VideoStat, stat => stat.video)
  stats: VideoStat[]

  ///

  createVideoMeta () {
    const meta = new VideoMeta()
    const cols = VideoMeta.getColumnNames('id', 'video_id', 'createdAt')
    for (const col of cols) {
      meta[col] = this[col]
    }
    meta.video = this
    return meta
  }

  createVideoStat () {
    const stat = new VideoStat()
    const cols = VideoStat.getColumnNames('id', 'video_id', 'createdAt')
    for (const col of cols) {
      stat[col] = this[col]
    }
    stat.video = this
    return stat
  }
}
