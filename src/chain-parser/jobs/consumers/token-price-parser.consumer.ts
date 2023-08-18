import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TokenContract } from '../../entities/token-contract.entity';
import { TokenContractPriceService } from '../../services/token-contract-price.service';
import {
  PARSE_TOKEN_PRICE_JOB,
  TOKEN_PRICE_PROCESSOR,
} from '../producers/token-price-parser.producer';

@Processor(TOKEN_PRICE_PROCESSOR)
export class TokenPriceParserConsumer {
  constructor(private readonly service: TokenContractPriceService) {}

  @Process(PARSE_TOKEN_PRICE_JOB)
  async parseTokenPrice(job: Job<TokenContract>) {
    const { decimal_place, slug } = job.data;

    const queries = [this.service.parseTokenPrice(job.data)];

    if (!decimal_place || !slug) {
      queries.unshift(this.service.parseAdditionalTokenData(job.data));
    }

    await Promise.allSettled(queries);
  }
}
