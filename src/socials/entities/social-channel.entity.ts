import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

export enum SocialServiceList {
  TWITTER = 'TWITTER',
  DISCORD = 'DISCORD',
  TELEGRAM = 'TELEGRAM',
  TELEGRAM_CHAT = 'TELEGRAM_CHAT',
  MEDIUM = 'MEDIUM',
  UNKNOWN = 'UNKNOWN',
}

@Entity()
@Unique(['service', 'channel'])
export class SocialChannel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'integer',
  })
  game_id: number;

  @Column({
    name: 'service',
    type: 'enum',
    enum: SocialServiceList,
  })
  service: SocialServiceList;

  @Column({
    name: 'channel',
    type: 'text',
  })
  channel: string;
}
