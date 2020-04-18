
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

@Entity('channel_records')
export class ChannelRecord extends ExtendEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'channel_id' })
  channelId: number

  // { columnMame: [old, new] ... }
  @Column({ type: 'json' })
  json: Object

  ///

  @CreateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)', name: 'created_at' })
  createdAt: Date

  ///

  @ManyToOne(type => Channel, channel => channel.records)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel
}
