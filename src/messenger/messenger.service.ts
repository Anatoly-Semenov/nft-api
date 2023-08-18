import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessagesRequestDto } from './dto/messages-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { MessageUser } from './entities/message-user.entity';
import { MessagesResponseDto } from './dto/messages-response.dto';
import { MessageDto } from './dto/message-response.dto';
import { MessageUserStatusEnum } from './enums/message-user-status.enum';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { SignDto } from './dto/sign.dto';

@Injectable()
export class MessengerService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(MessageUser)
    private readonly messageUserRepository: Repository<MessageUser>,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async sign(signDto: SignDto) {
    const user = await this.usersService.findByWalletAddress(
      signDto.walletAddress,
    );
    const isValidSignature = await this.verifySignature(
      user.id,
      signDto.signature,
    );

    if (!isValidSignature) {
      throw new BadRequestException('Invalid signature');
    }

    return await this.authService.authUser(user, { hasMessengerAccess: true });
  }

  async getMessages(
    walletAddress: string,
    query: MessagesRequestDto,
  ): Promise<MessagesResponseDto> {
    const total = await this.messageUserRepository.count({
      walletAddress,
      status: query.status,
    });

    const messages = await this.getMessageList(walletAddress, query);

    return {
      total,
      messages,
    };
  }

  async getMessage(
    messageUserId: string,
    walletAddress: string,
  ): Promise<MessageDto> {
    const messageUser = await this.getMessageUser(messageUserId, walletAddress);

    const message = await this.messageRepository.findOne({
      id: messageUser.message_id,
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return {
      id: messageUser.id,
      text: message.text,
      preview: message.preview || '',
      icon: message.icon || '',
      title: message.title,
      createdAt: message.created_at.toISOString(),
      reward: message.reward,
      status: messageUser.status,
    };
  }

  async read(messageUserId: string, walletAddress: string): Promise<boolean> {
    const messageUser = await this.getMessageUser(messageUserId, walletAddress);

    messageUser.status = MessageUserStatusEnum.READ;

    try {
      await this.messageUserRepository.save(messageUser);
      return true;
    } catch (e) {
      return false;
    }
  }

  async verifySignature(userId: number, signature: string): Promise<boolean> {
    const user = await this.usersService.findById(userId.toString());
    if (!user || !user.walletAddress) {
      throw new BadRequestException('Invalid signature');
    }

    try {
      const verifyResponse = await this.authService.verifySign({
        nonce: user.nonce,
        walletAddress: user.walletAddress,
        signature,
      });

      if (verifyResponse.status !== 'success') {
        throw new BadRequestException('Invalid signature');
      }

      await this.authService.createNonce({ walletAddress: user.walletAddress });

      return true;
    } catch (e) {
      throw new BadRequestException('Invalid signature');
    }
  }

  private async getMessageUser(
    messageUserId: string,
    walletAddress: string,
  ): Promise<MessageUser> {
    const messageUser = await this.messageUserRepository.findOne(messageUserId);
    if (!messageUser || messageUser.walletAddress !== walletAddress) {
      throw new NotFoundException('Message not found');
    }

    return messageUser;
  }

  private async getMessageList(
    walletAddress: string,
    query: MessagesRequestDto,
  ): Promise<MessageDto[]> {
    // const messagePerPage = 10;

    const messageList = await this.messageRepository
      .createQueryBuilder('m')
      .select([
        'm.text as text',
        'm.icon as icon',
        'm.preview as preview',
        'm.title as title',
        'mu.status as status',
        'm.created_at as "createdAt"',
        'm.reward as reward',
        'mu.id as id',
      ])
      .innerJoin(MessageUser, 'mu', 'mu.message_id=m.id')
      .where('mu.walletAddress=:walletAddress', { walletAddress })
      // .andWhere('mu.status=:status', { status: query.status })
      .orderBy('m.created_at', 'DESC')
      // .offset(messagePerPage * (query.page - 1))
      // .limit(messagePerPage)
      .getRawMany();

    return messageList.map((messageListElement) => ({
      ...messageListElement,
      icon: messageListElement.icon || '',
      preview: messageListElement.preview || '',
    }));
  }
}
