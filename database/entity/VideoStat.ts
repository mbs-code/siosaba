
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

@Entity('video_stats')
export class VideoStat extends ExtendEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'video_id' })
  videoId: number

  ///

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

  ///

  @ManyToOne(type => Video, video => video.stats)
  @JoinColumn({ name: 'video_id' })
  video: Video
}
