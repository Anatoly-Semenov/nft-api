import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique('token-price-row', ['token_contract_id', 'created_at'])
export class TokenContractPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  price: number;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  token_contract_id: number;
}
