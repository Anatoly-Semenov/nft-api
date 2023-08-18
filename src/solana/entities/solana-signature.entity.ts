import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { SolanaSignatureStateEnum } from '../enums/solana-signature-state.enum';

@Entity()
export class SolanaSignature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  signature: string;

  @Column()
  @Index()
  slot: number;

  @Column({
    default: false,
  })
  is_failed: boolean;

  @Column()
  block_time: number;

  @Column('enum', {
    enum: SolanaSignatureStateEnum,
    default: SolanaSignatureStateEnum.NEW,
  })
  state: string;

  @Column({ nullable: true })
  solana_associated_token_account_id: number;

  @Column({ nullable: true })
  @Index()
  account_id: number;
}
