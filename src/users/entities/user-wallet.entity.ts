import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UserAchievement } from './user-achievement.entity';
import { User } from './user.entity';
import { BlockchainEnum } from '../enums/blockchain.enum';

@Entity()
@Unique(['wallet'])
export class UserWallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  wallet: string;

  @Column({ default: false })
  is_verified: boolean;

  @UpdateDateColumn()
  updated_ad: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.wallets)
  user: User;

  @OneToMany(() => UserAchievement, (achievement) => achievement.wallet)
  achievements: UserAchievement[];

  @Column('enum', {
    name: 'blockchain_type',
    enum: BlockchainEnum,
    default: BlockchainEnum.EVM,
  })
  blockchainType;
}
