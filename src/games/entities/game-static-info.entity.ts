import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GameStaticInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  game_id: number;

  @Column()
  month_return: number;

  @Column()
  month_return_usd: number;

  @Column()
  player_count: number;

  @Column()
  current_price_usd: number;

  @Column()
  market_cap_usd: number;
}
