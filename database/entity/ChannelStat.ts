import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne
} from 'typeorm'

import { Channel } from './Channel'

@Entity('channel_stats')
export class ChannelStats extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

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

  @ManyToOne(type => Channel, channel => channel.stats)
  channel: Channel
}
