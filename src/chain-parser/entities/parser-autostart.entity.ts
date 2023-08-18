import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ParserAutostart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'game_id' })
  gameId: number;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'finished_at' })
  finishedAt: Date;

  @Column()
  status: string;
}
