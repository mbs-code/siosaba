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

  ///

  @Column({ type: 'int', unsigned: true, nullable: true })
  view: number

  @Column({ type: 'int', unsigned: true, nullable: true })
  comment: number

  @Column({ type: 'int', unsigned: true, nullable: true })
  subscriber: number

  @Column({ type: 'int', unsigned: true, nullable: true })
  video: number

  ///

  @CreateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)', name: 'created_at' })
  createdAt: Date

  ///

  @ManyToOne(type => Channel, channel => channel.stats)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel
}
