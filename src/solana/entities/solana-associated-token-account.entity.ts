import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { SolanaAssociatedTokenAccountType } from '../enums/solana-associated-token-account-type.enum';

@Entity()
export class SolanaAssociatedTokenAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  mint: string;

  @Column()
  associated_token_account: string;

  @Column('enum', {
    enum: SolanaAssociatedTokenAccountType,
    default: SolanaAssociatedTokenAccountType.UNKNOWN,
  })
  type: string;

  @Column()
  account_id: number;
}
