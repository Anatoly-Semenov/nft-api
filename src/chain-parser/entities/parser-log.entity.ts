import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ParserLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  created_at: Date;

  @Column()
  parser_progress_id: number;

  @Column()
  current_value: number;

  @Column({ nullable: true, type: 'text' })
  comment: string;
}
