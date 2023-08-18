import { Module } from '@nestjs/common';
import { AirdropsService } from './airdrops.service';
import { AirdropsController } from './airdrops.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airdrop } from './entities/airdrop.entity';
import { AirdropMaticService } from './services/airdrop-matic.service';
import { AirdropMaticController } from './airdrop-matic.controller';
import { ProfileModule } from '../profile/profile.module';
import { UsersModule } from '../users/users.module';
import { AirdropMatic } from './entities/airdrop-matic.entity';
import {
  AIRDROP_MATIC_REPOSITORY_SERVICE_NAME,
  AirdropMaticRepository,
} from './repositories/airdrop-matic.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Airdrop, AirdropMatic]),
    ProfileModule,
    UsersModule,
  ],
  providers: [
    AirdropsService,
    AirdropMaticService,
    {
      provide: AIRDROP_MATIC_REPOSITORY_SERVICE_NAME,
      useClass: AirdropMaticRepository,
    },
  ],
  controllers: [AirdropsController, AirdropMaticController],
})
export class AirdropsModule {}
