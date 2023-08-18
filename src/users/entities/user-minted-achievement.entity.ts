import { Achievement } from 'src/achievements/entities/achievement.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Unique(['achievement', 'user'])
export class UserMintedAchievement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Achievement, (achievement) => achievement.minter)
  @JoinColumn({ name: 'achievement_id' })
  achievement: Achievement;

  @ManyToOne(() => User, (user) => user.mintedAchievements)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
