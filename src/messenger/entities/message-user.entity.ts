import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { MessageUserStatusEnum } from '../enums/message-user-status.enum';

@Entity()
@Index(['message_id', 'walletAddress'], { unique: true })
export class MessageUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  message_id: number;

  @Column()
  @Index()
  walletAddress: string;

  @Column({
    type: 'enum',
    enum: MessageUserStatusEnum,
    default: MessageUserStatusEnum.NEW,
  })
  status: MessageUserStatusEnum;
}
