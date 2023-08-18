import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SolanaAccountTransactionTransferType } from '../enums/solana-account-transaction-transfer-type.enum';

@Entity()
export class SolanaAccountTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  from_account_id: number;

  @Column()
  to_account_id: number;

  @Column({ nullable: true })
  token_id: string;

  @Column({ type: 'bigint', nullable: true })
  amount: string;

  @Column()
  created_at: Date;

  @Column()
  transaction_hash: string;

  @Column()
  token_contract_id: number;

  @Column()
  game_id: number;

  @Column('enum', {
    enum: SolanaAccountTransactionTransferType,
    default: SolanaAccountTransactionTransferType.TRANSFER,
  })
  transaction_type: string;
}
