import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { GameContractTypeEnum } from '../enums/game-contract-type.enum';

@Entity()
export class GameContract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  game_id: number;

  @Column({ default: false })
  force_grab_internal: boolean;

  @Column({
    type: 'enum',
    enum: GameContractTypeEnum,
    default: GameContractTypeEnum.GAME,
  })
  type: GameContractTypeEnum;
}
