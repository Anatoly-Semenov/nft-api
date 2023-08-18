import { Achievement } from 'src/achievements/entities/achievement.entity';
import { SteamAchievement } from 'src/achievements/entities/steam-achievement.entity';
import { GameUsersStats } from 'src/chain-parser/entities/game-users-stats.entity';
import { PlayerStats } from 'src/player-stats/entities/player-stats.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { GameProvider } from '../enums/game-provider.enum';
import { GameAdditionalInfo } from './game-additional-info.entity';

export enum GameCode {
  BOMB_CRYPTO = 'BOMB_CRYPTO',
  AXIE_INFINITY = 'AXIE_INFINITY',
  PEGAXY = 'PEGAXY',
  CYBALL = 'CYBALL',
  METAGEAR = 'METAGEAR',
  DRUNK_ROBOTS = 'DRUNK_ROBOTS',
  FORTNITE = 'FORTNITE',
}

@Entity()
@Unique(['title'])
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  genre: string;

  @Column({
    nullable: true,
  })
  logo: string;

  @Column()
  image: string;

  @Column()
  site: string;

  @Column({ default: 0 })
  min_investment_token: number;

  @Column({ nullable: true })
  token_title?: string;

  @Column({ nullable: true })
  release_date?: string;

  @Column({ nullable: true })
  chain_title?: string;

  @Column({ default: false })
  in_use: boolean;

  @Column({
    default: false,
  })
  is_upcoming: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  is_on_chain: boolean;

  @Column({
    type: 'enum',
    enum: GameCode,
    nullable: true,
  })
  code: GameCode;

  @Column('text', { nullable: true })
  chains?: string;

  @Column('text', { nullable: true })
  background_image?: string;

  @Column({ nullable: true })
  steam_id?: number;

  @Column({
    type: 'enum',
    enum: GameProvider,
    default: GameProvider.EVM,
  })
  provider: GameProvider;

  @OneToOne(() => GameAdditionalInfo, { nullable: true })
  @JoinColumn()
  additional_info?: GameAdditionalInfo;

  @OneToMany(() => Achievement, (achievement) => achievement.game)
  @JoinColumn()
  achievements: Achievement[];

  @OneToMany(() => PlayerStats, (playerStats) => playerStats.game)
  @JoinColumn()
  playerStats: PlayerStats[];

  @OneToMany(
    () => SteamAchievement,
    (steamAchievement) => steamAchievement.game,
  )
  @JoinColumn()
  steamAchievements: SteamAchievement[];

  @OneToMany(() => GameUsersStats, (stats) => stats.game)
  usersStats: GameUsersStats[];
}
