import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AchievementProgressStatus } from '../enums/achievement-progress-status.enum';

@Entity()
export class AchievementProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @Column('enum', {
    enum: AchievementProgressStatus,
    default: AchievementProgressStatus.WAITING,
  })
  status: AchievementProgressStatus;

  @Column({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'finished_at' })
  finishedAt: Date;
}
