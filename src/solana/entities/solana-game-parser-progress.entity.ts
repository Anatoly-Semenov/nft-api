import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SolanaGameParserProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  game_id: number;

  @Column()
  activity_number: number;

  @Column()
  method_number: number;

  @Column({ default: 0 })
  aggregation_method_number: number;
}
