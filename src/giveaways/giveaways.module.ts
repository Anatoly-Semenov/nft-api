import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Giveaway } from './entities/giveaway.entity';
import { GiveawaysController } from './giveaways.controller';
import { GiveawayService } from './giveaways.service';

@Module({
  imports: [TypeOrmModule.forFeature([Giveaway])],
  controllers: [GiveawaysController],
  providers: [GiveawayService],
  exports: [GiveawayService],
})
export class GiveawaysModule {}
