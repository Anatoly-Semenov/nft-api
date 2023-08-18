import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { GetUser } from '../users/decorators/get-user.decorator';
import { MessagesRequestDto } from './dto/messages-request.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesResponseDto } from './dto/messages-response.dto';
import { ReadMessageRequestDto } from './dto/read-message-request.dto';
import { SignDto } from './dto/sign.dto';
import { ForbiddenException } from '@nestjs/common/exceptions/forbidden.exception';
import { AuthTokens } from '../auth/interfaces/auth-tokens.interface';

@Controller('messenger')
@ApiTags('Messenger')
@ApiBearerAuth()
export class MessengerController {
  constructor(private readonly messengerService: MessengerService) {}

  @Post('sign')
  @ApiResponse({
    status: 200,
    description: 'Return tokens for user session',
  })
  @ApiResponse({ status: 400, description: 'Invalid signature' })
  @ApiResponse({ status: 404, description: 'User not found' })
  sign(@Body() signDto: SignDto): Promise<AuthTokens> {
    return this.messengerService.sign(signDto);
  }

  @Get('/messages')
  @ApiResponse({
    status: 200,
    description: 'Get list of message for current user',
    type: MessagesResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not enough rights' })
  @UseGuards(JwtAuthGuard)
  messages(
    @GetUser('walletAddress') walletAddress: string,
    @GetUser('hasMessengerAccess') hasMessengerAccess: boolean,
    @Query() query: MessagesRequestDto,
  ): Promise<MessagesResponseDto> {
    if (!hasMessengerAccess) {
      throw new ForbiddenException('Not enough rights');
    }

    return this.messengerService.getMessages(walletAddress, query);
  }

  @Post('/messages/:id/read')
  @ApiResponse({
    status: 200,
    description: 'Read message for current user',
  })
  @ApiResponse({ status: 400, description: 'Invalid signature' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(JwtAuthGuard)
  async read(
    @GetUser('id') userId: number,
    @GetUser('walletAddress') walletAddress: string,
    @Param('id') id: string,
    @Body() readMessageRequestDto: ReadMessageRequestDto,
  ): Promise<boolean> {
    const isValidSignature = await this.messengerService.verifySignature(
      userId,
      readMessageRequestDto.signature,
    );

    if (!isValidSignature) {
      return false;
    }

    return await this.messengerService.read(id, walletAddress);
  }
}
