import { Game } from 'src/games/entities/game.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['game', 'createdAt'])
export class GameUsersStats {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Game, (game) => game.usersStats)
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @Column({ name: 'active_users', default: 0 })
  activeUsers: number;

  @Column({ name: 'new_users', default: 0 })
  newUsers: number;

  @Column({ default: 0, type: 'float' })
  average: number;

  @Column({ default: 0 })
  earners: number;

  @Column({ default: 0 })
  spenders: number;

  @Column({ default: 0, type: 'float' })
  earnings: number;

  @Column({ default: 0, type: 'float' })
  spending: number;

  @Column({ name: 'new_paying_users', default: 0 })
  newPayingUsers: number;

  @Column({ name: 'new_earners', default: 0 })
  newEarners: number;

  @Column({ name: 'new_spenders', default: 0 })
  newSpenders: number;

  @Column({ name: 'new_earnings', default: 0, type: 'float' })
  newEarnings: number;

  @Column({ name: 'new_spending', default: 0, type: 'float' })
  newSpending: number;

  @Column({ name: 'nft_trades', default: 0 })
  nftTrades: number;

  @Column({ name: 'nft_amount', type: 'float', default: 0 })
  nftAmount: number;

  @Column({ name: 'nft_burn', default: 0 })
  nftBurn: number;

  @Column({ name: 'nft_mint', default: 0 })
  nftMint: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
