import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_block: number;

  @Column()
  @Index()
  address: string;

  @Column()
  game_id: number;

  @Column({ default: false })
  is_contract: boolean;

  @Column({ default: false })
  is_player: boolean;

  @Column({ nullable: true })
  first_time: Date;

  @Column({ default: false })
  is_system: boolean;
}
