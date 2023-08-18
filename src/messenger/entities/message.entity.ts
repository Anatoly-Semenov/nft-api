import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  preview?: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({ type: 'text' })
  text: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  reward: number;
}
