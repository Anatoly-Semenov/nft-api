import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TokenContract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  game_id: number;

  @Column({ default: 'binance-smart-chain' })
  chain_id: string;

  @Column({ default: true })
  is_coin: boolean;

  @Column({ nullable: true })
  decimal_place?: number;

  @Column({ nullable: true })
  slug?: string;
}
