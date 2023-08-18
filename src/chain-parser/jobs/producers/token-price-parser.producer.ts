import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { TokenContract } from '../../entities/token-contract.entity';
import { Injectable } from '@nestjs/common';

export const TOKEN_PRICE_PROCESSOR = 'token-contract-parser';
export const PARSE_TOKEN_PRICE_JOB = 'parse-token-price';

@Injectable()
export class TokenPriceParserProducer {
  constructor(
    @InjectQueue(TOKEN_PRICE_PROCESSOR)
    private readonly tokenParserQueue: Queue,
  ) {}

  async add(token: TokenContract) {
    await this.tokenParserQueue.add(PARSE_TOKEN_PRICE_JOB, token, {
      removeOnComplete: true,
      removeOnFail: true,
    });
  }

  async addWithDelay(token: TokenContract, index: number) {
    await this.tokenParserQueue.add(PARSE_TOKEN_PRICE_JOB, token, {
      removeOnComplete: true,
      removeOnFail: true, // Avoid coingecko rate limit
      delay: (index + 1) * 5000,
    });
  }
}
