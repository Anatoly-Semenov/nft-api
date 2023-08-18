import { Module } from '@nestjs/common';
import { MessengerController } from './messenger.controller';
import { MessengerService } from './messenger.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageUser } from './entities/message-user.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, MessageUser]),
    AuthModule,
    UsersModule,
  ],
  controllers: [MessengerController],
  providers: [MessengerService],
})
export class MessengerModule {}
