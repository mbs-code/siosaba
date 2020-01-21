import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm'

import { DiffEntity } from './DiffEntity'
import { ChannelStats } from './ChannelStat'

@Entity('channels')
export class Channel extends DiffEntity {
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

  @Column({ nullable: true })
  keyword: string

  @Column({ nullable: true })
  banner: string

  @Column({ nullable: true, name: 'banner_hires' })
  bannerHires: string

  @Column({ nullable: true, name: 'published_at' })
  publishedAt: Date

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date

  @OneToMany(type => ChannelStats, stats => stats.channel)
  stats: ChannelStats[]
}
