import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ParserProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  started_at: Date;

  @Column()
  updated_at: Date;

  @Column({ nullable: true })
  game_id?: number;

  @Column()
  start_value: number;

  @Column()
  current_value: number;

  @Column()
  end_value: number;

  @Column({ type: 'bigint' })
  time_left_ms: string;

  @Column()
  type: string;

  @Column({ default: 0 })
  step: number;

  @Column({ nullable: true })
  status: string;
}
