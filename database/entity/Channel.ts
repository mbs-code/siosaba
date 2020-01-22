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
import { ChannelMeta } from './ChannelMeta'
import { ChannelStat } from './ChannelStat'

@Entity('channels')
export class Channel extends DiffEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Index({ unique: true })
  @Column()
  key: string

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date

  @OneToMany(type => ChannelMeta, meta => meta.channel, {
    cascade: true
  })
  metas: ChannelMeta[]

  @OneToMany(type => ChannelStat, stat => stat.channel, {
    cascade: true
  })
  stats: ChannelStat[]
}
