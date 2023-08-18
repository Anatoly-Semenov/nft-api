import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FeedbackTypeList {
  GAME_REQUEST = 'GAME_REQUEST',
}

export type FeedbackDataGameRequest = {
  name: string;
  link: string;
  description?: string;
};

export type FeedbackData = FeedbackDataGameRequest;

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: FeedbackTypeList,
  })
  type: FeedbackTypeList;

  @Column({
    type: 'jsonb',
  })
  data: FeedbackData;

  @ManyToOne(() => User, (user) => user.feedbacks)
  @JoinColumn()
  creator?: User;

  @Column({ type: 'bool', default: false })
  viewed: boolean;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;

  constructor(partial?: DeepPartial<Feedback>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
