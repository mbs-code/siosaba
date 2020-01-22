import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne
} from 'typeorm'

import { DiffEntity } from './DiffEntity'
import { Channel } from './Channel'

@Entity('channel_metas')
export class ChannelMeta extends DiffEntity {
  @PrimaryGeneratedColumn()
  id: number

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

  @ManyToOne(type => Channel, channel => channel.metas)
  channel: Channel
}
