import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AnalyticsClientGame {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  analyticsClientId: number;

  @Column()
  gameId: number;
}
