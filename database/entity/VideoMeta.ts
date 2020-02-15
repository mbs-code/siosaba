import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm'

import { ExtendEntity } from './ExtendEntity'
import { Video } from './Video'
import { VideoType } from './type/VideoType'
import { VideoStatus } from './type/VideoStatus'

@Entity('video_metas')
export class VideoMeta extends ExtendEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'video_id' })
  videoId: number

  ///

  // @Index({ unique: true }) <- not unique
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

  @Column({ type: 'int', unsigned: true })
  duration: number

  // この2つは計算で導けるので無視する(必要ない)
  // @Column({ type: 'datetime', precision: 3, nullable: true, name: 'start_time' })
  // startTime: Date // DB 抽出用

  // @Column({ type: 'datetime', precision: 3, nullable: true, name: 'end_time' })
  // endTime: Date // DB 抽出用

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

  @CreateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)', name: 'created_at' })
  createdAt: Date

  ///

  @ManyToOne(type => Video, video => video.metas)
  @JoinColumn({ name: 'video_id' })
  video: Video
}
