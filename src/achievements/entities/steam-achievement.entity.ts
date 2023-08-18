import { Game } from 'src/games/entities/game.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index(['name', 'steamAppId'], { unique: true })
export class SteamAchievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column()
  description: string;

  @Column()
  image: string;

  @Column({ name: 'steam_app_id' })
  steamAppId: number;

  @ManyToOne(() => Game, (game) => game.achievements)
  @JoinColumn({ name: 'game_id' })
  game: Game;
}
