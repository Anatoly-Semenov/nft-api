import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AutostartService } from '../../services/autostart.service';
import { ChainParserService } from '../../chain-parser.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AutostartParsingProduces {
  private readonly logger = new Logger(AutostartParsingProduces.name);

  constructor(
    private configService: ConfigService,
    private autostartService: AutostartService,
    private readonly chainParserSrv: ChainParserService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async runParse(): Promise<void> {
    if (!this.configService.get<boolean>('isParserCronJobsEnabled')) return;

    const autostartGame = await this.autostartService.getGameForRun();

    if (!autostartGame) {
      this.logger.warn(`Skip autostart game parsing`);
      return;
    }

    const timeSpend = new Date().getTime() - autostartGame.finishedAt.getTime();

    if (timeSpend < 3 * 60 * 1000) {
      this.logger.warn(`Last parsing process less than 5 min ago`);
      return;
    }

    this.logger.log(`Try to autostart parse game: ${autostartGame.gameId}`);

    await this.chainParserSrv.addJobToQueue(autostartGame.gameId);
  }
}
