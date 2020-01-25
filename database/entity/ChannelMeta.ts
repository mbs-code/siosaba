import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm'

import { ExtendEntity } from './ExtendEntity'
import { Channel } from './Channel'

@Entity('channel_metas')
export class ChannelMeta extends ExtendEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'channel_id' })
  channelId: number

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

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date

  ///

  @ManyToOne(type => Channel, channel => channel.metas)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel
}
