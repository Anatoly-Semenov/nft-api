import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SettingsKey } from '../enums/settings-key.enum';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: SettingsKey, unique: true })
  key: SettingsKey;

  @Column()
  value: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
