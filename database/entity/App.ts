import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'

import { ExtendEntity } from './ExtendEntity'
import { AppVariableKey } from './type/AppVariableKey'

@Entity('apps')
export class App extends ExtendEntity {
  @PrimaryGeneratedColumn()
  id: number

  ///

  @Index({ unique: true })
  @Column({ type: 'enum', enum: AppVariableKey })
  key: AppVariableKey

  @Column({ type: 'mediumtext', nullable: true })
  value: string

  ///

  @CreateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)', name: 'updated_at' })
  updatedAt: Date
}
