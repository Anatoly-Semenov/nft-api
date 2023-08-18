import { Game } from 'src/games/entities/game.entity';
import { UserAchievement } from 'src/users/entities/user-achievement.entity';
import { UserMintedAchievement } from 'src/users/entities/user-minted-achievement.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AchievementRule } from '../interfaces/achievement-rule.interface';

@Entity()
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, default: 'Untitled' })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: 1 })
  scores: number;

  @Column({ nullable: true })
  chain?: string;

  @Column('simple-json', { default: '[]' })
  rules: AchievementRule[];

  @UpdateDateColumn()
  updatedAt?: Date;

  @CreateDateColumn()
  createdAt?: Date;

  @OneToMany(() => UserAchievement, (user) => user.achievement)
  user: UserAchievement[];

  @OneToMany(() => UserMintedAchievement, (user) => user.achievement)
  minter: UserMintedAchievement[];

  @ManyToOne(() => Game, (game) => game.achievements)
  @JoinColumn()
  game: Game;
}
