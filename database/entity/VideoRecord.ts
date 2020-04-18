
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

@Entity('video_records')
export class VideoRecord extends ExtendEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'video_id' })
  videoId: number

  // { columnMame: [old, new] ... }
  @Column({ type: 'json' })
  json: Object

  ///

  @CreateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)', name: 'created_at' })
  createdAt: Date

  ///

  @ManyToOne(type => Video, video => video.records)
  @JoinColumn({ name: 'video_id' })
  video: Video
}
