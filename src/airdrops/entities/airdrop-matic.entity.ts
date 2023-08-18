import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AirdropMaticStatus } from '../enums/airdrop-matic-status.enum';

@Entity()
@Index(['user_id'], { unique: true })
export class AirdropMatic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  transaction_hash: string;

  @Column('enum', {
    enum: AirdropMaticStatus,
    default: AirdropMaticStatus.SEND,
  })
  status: AirdropMaticStatus;

  @UpdateDateColumn()
  request_time?: Date;
}
