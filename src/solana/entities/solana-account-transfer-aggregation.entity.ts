import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SolanaGameContractTypeEnum } from '../enums/solana-game-contract-type.enum';
import { SolanaAccountTransferEnum } from '../enums/solana-account-transfer.enum';

@Entity()
export class SolanaAccountTransferAggregation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'main_account_id', type: 'integer' })
  @Index()
  mainAccountId: string;

  @Column({ name: 'second_account_id', type: 'integer' })
  secondAccountId: string;

  @Column({ name: 'main_address', type: 'text' })
  mainAddress: string;

  @Column({ name: 'second_address', type: 'text' })
  secondAddress: string;

  @Column({ name: 'main_first_time', nullable: true })
  @Index()
  mainFirstTime: Date;

  @Column({ name: 'second_first_time', nullable: true })
  secondFirstTime: Date;

  @Column({ name: 'is_contract' })
  @Index()
  isContract: boolean;

  @Column({ name: 'token_contract_id' })
  tokenContractId: number;

  @Column({ name: 'token_contract_address' })
  tokenContractAddress: string;

  @Column({ name: 'token_contract_title' })
  tokenContractTitle: string;

  @Column({ name: 'token_price', type: 'float', nullable: true })
  tokenPrice: number;

  @Column({ type: 'decimal' })
  @Index()
  amount: string;

  @Column({ name: 'game_id' })
  @Index()
  gameId: number;

  @Column({
    name: 'game_contract_type',
    type: 'enum',
    enum: SolanaGameContractTypeEnum,
    nullable: true,
  })
  gameContractType: SolanaGameContractTypeEnum;

  @Column({ name: 'transaction_hash' })
  @Index()
  transactionHash: string;

  @Column({ name: 'transaction_contract', nullable: true })
  transactionContract: string;

  @Column({ name: 'block_number', nullable: true })
  blockNumber: number;

  @Column({ name: 'parent_id', type: 'integer', nullable: true })
  parentId: number;

  @Column({ name: 'nft_parent_id', type: 'integer', nullable: true })
  nftParentId: number;

  @Column({
    name: 'transfer_type',
    type: 'enum',
    enum: SolanaAccountTransferEnum,
  })
  transferType: SolanaAccountTransferEnum;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @Column({ nullable: true })
  method: string;

  @CreateDateColumn({
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_DATE',
  })
  @Index()
  createdAt: Date;

  @Column({ name: 'token_decimal_place', default: 9 })
  tokenDecimalPlace: number;
}
