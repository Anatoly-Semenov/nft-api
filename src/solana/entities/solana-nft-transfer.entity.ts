import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SolanaNftTransfer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  from_account_id: number;

  @Column()
  to_account_id: number;

  @Column({ nullable: true })
  @Index()
  token_id: string;

  @Column({ type: 'bigint', nullable: true })
  buyer_amount: string;

  @Column({ type: 'bigint', nullable: true })
  seller_amount: string;

  @Column()
  @Index()
  created_at: Date;

  @Column()
  transaction_hash: string;

  @Column()
  token_contract_id: number;

  @Column()
  game_id: number;
}
