import { Game } from 'src/games/entities/game.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class PlayerStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('simple-json')
  result: Record<string, any>;

  @ManyToOne(() => User, (user) => user.stats)
  user: User;

  @CreateDateColumn()
  createdAt?: Date;

  @ManyToOne(() => Game, (game) => game.playerStats)
  @JoinColumn()
  game: Game;
}
