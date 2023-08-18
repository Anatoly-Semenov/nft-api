import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Types
import { UserSocialProfile } from '../interfaces/user-social-profile.interface';
import { RegisterFromEnum } from '../enums/register-from.enum';
import { UserRole } from '../enums/user-role.emun';

// Entities
import { PlayerStats } from 'src/player-stats/entities/player-stats.entity';
import { UserWallet } from './user-wallet.entity';
import { Feedback } from 'src/feedback/entities/Feedback.entity';
import { UserAchievement } from './user-achievement.entity';
import { UserBalanceRecord } from './user-balance-record.entity';
import { UserMintedAchievement } from './user-minted-achievement.entity';
import { Referral } from 'src/referral/entities/referral.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  walletAddress?: string;

  @Column('enum', { array: true, enum: UserRole, default: [UserRole.USER] })
  roles: UserRole[];

  @Column({ nullable: true })
  displayedName?: string;

  @Column({ nullable: true })
  nonce?: string;

  @Column({ nullable: true })
  email?: string;

  @Column('simple-json', { nullable: true })
  steam?: UserSocialProfile;

  @Column('simple-json', { nullable: true })
  discord?: UserSocialProfile;

  @Column('simple-json', { nullable: true })
  twitter?: UserSocialProfile;

  @Column('simple-json', { nullable: true })
  epicGames?: UserSocialProfile;

  @Column({ nullable: true, unique: true })
  solanaAccount?: string;

  @UpdateDateColumn()
  updatedAt?: Date;

  @CreateDateColumn()
  createdAt?: Date;

  @OneToMany(() => PlayerStats, (stats) => stats.user)
  stats: PlayerStats[];

  @OneToMany(() => UserWallet, (wallet) => wallet.user)
  wallets: UserWallet[];

  @OneToMany(() => UserAchievement, (achievement) => achievement.user)
  achievements: UserAchievement[];

  @OneToMany(() => UserBalanceRecord, (record) => record.user)
  records: UserBalanceRecord[];

  @OneToMany(() => Referral, (referral) => referral.sender)
  referralSenders: User[];

  @OneToOne(() => Referral, (referral) => referral.newUser)
  referralNewUsers: User[];

  @OneToMany(() => Feedback, (feedback) => feedback.creator)
  @JoinTable()
  feedbacks: Feedback[];

  @OneToMany(() => UserMintedAchievement, (achievement) => achievement.user)
  mintedAchievements: UserMintedAchievement[];

  @Column('enum', {
    name: 'register_from',
    enum: RegisterFromEnum,
    default: RegisterFromEnum.MAIN_SITE,
  })
  registerFrom;
}
