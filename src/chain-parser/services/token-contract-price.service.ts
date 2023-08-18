import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenContract } from '../entities/token-contract.entity';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { TokenContractPrice } from '../entities/token-contract-price.entity';
import { HttpService } from '@nestjs/axios';
import { TokenPriceParserProducer } from '../jobs/producers/token-price-parser.producer';
import * as moment from 'moment';

@Injectable()
export class TokenContractPriceService {
  private readonly logger = new Logger(TokenContractPriceService.name);

  constructor(
    private httpService: HttpService,
    @InjectRepository(TokenContract)
    private readonly tokenContractRepository: Repository<TokenContract>,
    @InjectRepository(TokenContractPrice)
    private tokenContractPriceRepository: Repository<TokenContractPrice>,
    private readonly tokenPriceParserProducer: TokenPriceParserProducer,
    private configService: ConfigService,
  ) {}

  async parseTokenPricesById(tokenId: string): Promise<void> {
    const token = await this.tokenContractRepository.findOne({
      where: { id: tokenId },
    });

    await this.tokenPriceParserProducer.add(token);
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async parseAllTokenPrices(): Promise<void> {
    if (!this.configService.get<boolean>('isCronJobsEnabled')) return;

    const tokens = await this.tokenContractRepository.find({
      where: { is_coin: true },
    });

    const queues = tokens.map((token, index) =>
      this.tokenPriceParserProducer.addWithDelay(token, index),
    );

    await Promise.all(queues);
  }

  async parseAdditionalTokenData(token: TokenContract): Promise<void> {
    const { chain_id, address, title } = token;

    try {
      const url = `https://api.coingecko.com/api/v3/coins/${chain_id}/contract/${address}`;

      const result = await firstValueFrom(this.httpService.get(url));
      const { detail_platforms, id: slug } = result.data;

      const decimal = detail_platforms?.[chain_id]?.decimal_place;

      if (decimal) {
        await this.tokenContractRepository.save({
          ...token,
          slug,
          decimal_place: decimal,
        });
      }
    } catch (error) {
      this.logger.error(`Token ${title} request to decimal place:`, error);
    }
  }

  async parseTokenPrice(token: TokenContract): Promise<void> {
    const { chain_id, address, title, slug, id } = token;
    this.logger.log(`sending request for token ${title}`);

    try {
      const coingeckoUrl = `https://api.coingecko.com/api/v3/coins/${chain_id}/contract/${address}/market_chart`;
      const coinStatusUrl = `https://api.coinstats.app/public/v1/charts`;

      let tokenPrices = [];

      // Не стал код сплитить, тк в случае, если новая api работает стабильно, то перейдем на нее
      if (chain_id === 'solana') {
        const result = await firstValueFrom(
          this.httpService.get(coinStatusUrl, {
            params: { period: 'all', coinId: slug },
          }),
        );

        tokenPrices = result.data.chart
          .map(([created_at, price]) => {
            return (
              !!price &&
              this.tokenContractPriceRepository.create({
                price,
                created_at: moment(created_at * 1000).format('YYYY-MM-DD'),
                token_contract_id: id,
              })
            );
          })
          .filter((el) => !!el);
      } else {
        const result = await firstValueFrom(
          this.httpService.get(coingeckoUrl, {
            params: { vs_currency: 'usd', days: 'max' },
          }),
        );

        tokenPrices = result.data.prices.map(([created_at, price]) =>
          this.tokenContractPriceRepository.create({
            price,
            created_at: moment(created_at).format('YYYY-MM-DD'),
            token_contract_id: id,
          }),
        );
      }

      await this.tokenContractPriceRepository
        .createQueryBuilder()
        .insert()
        .into(TokenContractPrice)
        .values(tokenPrices)
        .orIgnore()
        .execute();

      this.logger.log(`success to get token ${title} prices`);
    } catch (error) {
      this.logger.error(`token ${title} request error`, error);
    }
  }
}
