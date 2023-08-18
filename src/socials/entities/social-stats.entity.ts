import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['game_id', 'channel_id', 'date'])
export class SocialStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'game_id',
    type: 'integer',
  })
  game_id: number;

  @Column({
    name: 'channel_id',
    type: 'integer',
  })
  channel_id: number;

  @Column({
    type: 'integer',
  })
  members_count: number;

  @Column({
    type: 'integer',
    default: 0,
  })
  members_online_count: number;

  @Column({
    type: 'integer',
  })
  posts_count: number;

  @Column({
    type: 'integer',
  })
  reposts_count: number;

  @Column({
    type: 'integer',
  })
  likes_count: number;

  @Column({
    type: 'integer',
  })
  comments_count: number;

  @CreateDateColumn({
    name: 'date',
    default: () => 'CURRENT_DATE',
  })
  date: Date;
}
