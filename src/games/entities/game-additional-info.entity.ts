import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { GameDateEstimation } from '../enums/game-date-estimation.enum';

@Entity()
export class GameAdditionalInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { array: true, nullable: true })
  pictures?: string[];

  @Column('text', { array: true, nullable: true })
  video?: string[];

  @Column('text', { nullable: true })
  backers?: string;

  @Column('text', { nullable: true })
  chains?: string;

  @Column({ nullable: true })
  token_name?: string;

  @Column({ nullable: true })
  ido_platforms?: string;

  @Column({ nullable: true })
  ido_status?: string;

  @Column({ nullable: true })
  ido_date?: Date;

  @Column('enum', {
    enum: GameDateEstimation,
    default: GameDateEstimation.day,
  })
  ido_date_estimation?: string;

  @Column({ nullable: true })
  ino_status?: string;

  @Column({ nullable: true })
  marketplace?: string;

  @Column({ nullable: true })
  ino_date?: Date;

  @Column('enum', {
    enum: GameDateEstimation,
    default: GameDateEstimation.day,
  })
  ino_date_estimation?: string;

  @Column({ nullable: true })
  release_status?: string;

  @Column({ nullable: true })
  release_date?: Date;

  @Column('enum', {
    enum: GameDateEstimation,
    default: GameDateEstimation.day,
  })
  release_date_estimation?: string;
}
