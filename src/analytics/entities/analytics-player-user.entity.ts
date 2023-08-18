import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AnalyticsPlayerUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  analyticsPlayerPlayerId: string;

  @Column()
  userId: number;

  @Column({ default: -1 })
  gameId: number;

  @Column({ default: '' })
  discord: string;
}
