import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GameInfoAggregated {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  game_id: number;

  @Column({ type: 'float', nullable: true })
  monthly_return_token: number;

  @Column({ type: 'float', nullable: true })
  monthly_return_usd: number;

  @Column({ type: 'float', nullable: true })
  floor_price: number;

  @Column({ type: 'int', nullable: true })
  players_count: number;
}
