import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index(['address', 'game_id'], { unique: true })
export class SolanaAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_time: Date;

  @Column()
  address: string;

  @Column()
  game_id: number;

  @Column({ default: false })
  is_contract: boolean;

  @Column({ default: false })
  is_player: boolean;

  @Column({ default: false })
  is_mint: boolean;
}
