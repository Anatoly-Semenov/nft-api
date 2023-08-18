import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index(['id', 'gameId', 'grabInternal'])
export class GameTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'game_id' })
  @Index()
  gameId: number;

  @Column({ name: 'transaction_hash' })
  transactionHash: string;

  @Column({ name: 'block_number' })
  blockNumber: number;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'address_from' })
  addressFrom: string;

  @Column({ name: 'address_to' })
  addressTo: string;

  @Column({ type: 'decimal' })
  value: string;

  @Column()
  input: string;

  @Column({ name: 'grab_internal', default: false })
  @Index()
  grabInternal: boolean;
}
