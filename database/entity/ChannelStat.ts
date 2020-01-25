
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

@Entity('channel_stats')
export class ChannelStat extends ExtendEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'channel_id' })
  channelId: number

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

  ///

  @ManyToOne(type => Channel, channel => channel.stats)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel
}
