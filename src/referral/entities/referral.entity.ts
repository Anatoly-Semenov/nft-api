import {
  Entity,
  Unique,
  ManyToOne,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity()
@Unique(['newUser'])
export class Referral {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.referralSenders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @OneToOne(() => User, (user) => user.referralNewUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'new_user_id' })
  newUser: User;
}
