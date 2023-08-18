import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GameWallet {
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

  @Column({ default: false })
  is_system: boolean;
}
