import { Controller, Get } from '@nestjs/common';
import { SolanaCopyService } from './solana-copy.service';

@Controller('solana')
export class SolanaController {
  constructor(private readonly solanaCopyService: SolanaCopyService) {}

  @Get('ping')
  pong() {
    return this.solanaCopyService.pong();
  }
}
