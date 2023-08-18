import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AnalyticsEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  analyticsClientId: number;

  @Column({ type: 'timestamp' })
  datetime: Date;

  @Column()
  eventName: string;

  @Column({ nullable: true })
  playerId: string;

  @Column({ type: 'json', nullable: true })
  data: object;
}
