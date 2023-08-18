import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SocialServiceList } from './social-channel.entity';

@Entity()
export class SocialSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: SocialServiceList,
    unique: true,
  })
  service: SocialServiceList;

  @Column({
    type: 'text',
  })
  session: string;

  @UpdateDateColumn()
  updated_at: Date;

  @UpdateDateColumn()
  created_at: Date;
}
