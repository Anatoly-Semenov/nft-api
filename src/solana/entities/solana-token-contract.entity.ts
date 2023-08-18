import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SolanaTokenContract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  game_id: number;

  @Column({ nullable: true })
  token_contract_id: number;
}
