import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';
import { UsersModule } from 'src/users/users.module';

// Entity
import { Referral } from './entities/referral.entity';
import { UserBalanceRecord } from 'src/users/entities/user-balance-record.entity';
import { UserMintedAchievement } from 'src/users/entities/user-minted-achievement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Referral,
      UserBalanceRecord,
      UserMintedAchievement,
    ]),
    UsersModule,
  ],
  controllers: [ReferralController],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}
