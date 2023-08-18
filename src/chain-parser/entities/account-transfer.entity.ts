import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AccountTransfer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'from_account_id' })
  @Index()
  fromAccountId: number;

  @Column({ name: 'to_account_id' })
  @Index()
  toAccountId: number;

  @Column({ name: 'token_contract_id' })
  tokenContractId: number;

  @Column({ type: 'decimal', nullable: true, name: 'token_id' })
  tokenId: string;

  @Column({ type: 'decimal', nullable: true })
  amount: string;

  @Column({ nullable: true, name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'game_id' })
  @Index()
  gameId: number;

  @Column({ name: 'block_number' })
  blockNumber: number;

  @Column({ name: 'transaction_hash' })
  @Index()
  transactionHash: string;

  @Column({ nullable: true, name: 'transaction_contract' })
  transactionContract: string;

  @Column({ nullable: true })
  method: string;

  @Column({ nullable: true, name: 'parsing_stage' })
  parsingStage: string;
}
