import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AnalyticsPlayer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  analyticsClientId: number;

  @Column({ type: 'timestamp' })
  datetime: Date;

  @Column()
  playerId: string;

  @Column({ type: 'json' })
  data: object;
}
