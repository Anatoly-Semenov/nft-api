import { Achievement } from 'src/achievements/entities/achievement.entity';
import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserWallet } from './user-wallet.entity';
import { User } from './user.entity';

@Entity()
@Index(['achievement', 'user', 'wallet'], { unique: true })
export class UserAchievement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Achievement, (achievement) => achievement.user)
  achievement: Achievement;

  @ManyToOne(() => User, (user) => user.achievements)
  user: User;

  @ManyToOne(() => UserWallet, (wallet) => wallet.achievements)
  wallet: UserWallet;

  @UpdateDateColumn()
  updated_ad: Date;

  @CreateDateColumn()
  created_at: Date;
}
