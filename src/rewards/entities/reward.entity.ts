import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Reward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 0 })
  amount: number;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  currency?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true })
  link?: string;

  @Column({ default: () => 'CURRENT_DATE', name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'ended_at' })
  endedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
