import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AnalyticsClient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  apiKey: string;

  @Column()
  name: string;

  @Column()
  active: boolean;
}
