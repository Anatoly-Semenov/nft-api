import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProfileMoralisStatus } from '../enums/profile-moralis-status.enum';

@Entity()
export class ProfileMoralisLogs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: ProfileMoralisStatus;

  @Column()
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
