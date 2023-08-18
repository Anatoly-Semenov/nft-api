import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Giveaway {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'text',
  })
  image: string;

  @Column({
    type: 'text',
  })
  link_to_project: string;

  @Column({
    type: 'text',
  })
  prize_description: string;

  @Column({
    type: 'text',
  })
  link_to_join: string;

  @Column({
    type: 'timestamp',
  })
  start_date: Date;

  @Column({
    type: 'timestamp',
  })
  end_date: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
