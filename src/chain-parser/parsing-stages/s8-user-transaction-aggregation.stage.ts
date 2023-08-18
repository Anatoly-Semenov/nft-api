import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Game } from 'src/games/entities/game.entity';
import { Connection } from 'typeorm';
import { CreateProgressDto } from '../dto/create-progress.dto';
import { ParserConfigDto } from '../dto/parser-config.dto';
import { AccountTransferAggregation } from '../entities/account-transfer-aggregation.entity';
import { AccountTransferState } from '../enums/account-transfer.enum';
import { ProgressStage } from '../enums/progress-stage.enum';
import { ProgressService } from '../services/progress.service';
import { AccountTransferAggregationService } from '../services/account-transfer-aggregation.service';
import { ParsingStageAbstract } from './parsing-stage.abstract';

export const PARSING_STAGE_8 = 'PARSING_STAGE_8';

export type AssembleQueryPayload = {
  gameId: Game['id'];
  state: AccountTransferState;
  parentId?: AccountTransferAggregation['parentId'];
};

@Injectable()
export class S8UserTransactionAggregationStage extends ParsingStageAbstract {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    protected progressSrv: ProgressService,
    private readonly accountTransferAggregationService: AccountTransferAggregationService,
  ) {
    super();

    this.logger = new Logger(S8UserTransactionAggregationStage.name);
  }

  private assembleQuery({
    gameId,
    state,
    parentId = 0,
  }: AssembleQueryPayload): string {
    const mainAccount = state === AccountTransferState.SPEND ? 'af' : 'at';
    const secondAccount = state === AccountTransferState.SPEND ? 'at' : 'af';

    return `
      insert into account_transfer_aggregation (
        main_account_id,
        main_address,
        main_first_time,
        second_account_id,
        second_address,
        second_first_time,
        is_contract,
        token_contract_id,
        token_contract_title,
        token_contract_address,
        token_price,
        amount,
        created_at,
        game_id,
        block_number,
        transaction_hash,
        transaction_contract,
        game_contract_type,
        parent_id,
        is_system,
        method
      ) select ${mainAccount}.id as main_account_id,
        ${mainAccount}.address as main_address,
        ${mainAccount}.first_time as main_first_time,
        ${secondAccount}.id as second_account_id,
        ${secondAccount}.address as second_address,
        ${secondAccount}.first_time as second_first_time,
        ${mainAccount}.is_contract,
        t.token_contract_id,
        tc.title as token_contract_title,
        tc.address as token_contract_address,
        tcp.price as token_price,
        ${
          state === AccountTransferState.SPEND
            ? '-t.amount as amount'
            : 't.amount as amount'
        },
        t.created_at,
        t.game_id,
        t.block_number,
        t.transaction_hash,
        t.transaction_contract,
        gc.type::text::account_transfer_aggregation_game_contract_type_enum as game_contract_type,
        t.id as parent_id,
        case 
          when ${mainAccount}.is_system = true then true
          else false
        end as is_system,
        t.method as method
      from account_transfer as t
        join account af on t.from_account_id = af.id
        join account at on t.to_account_id = at.id
        left join game_contract gc on t.transaction_contract = gc.address
        join token_contract tc on t.token_contract_id = tc.id
        left join token_contract_price tcp on tcp.id = (
          select id from token_contract_price tcp2 where tcp2.token_contract_id = tc.id and tcp2.created_at::date = t.created_at::date order by tcp2.created_at ASC limit 1
        )
      where t.game_id = ${gameId} and t.token_id is null and t.id > ${parentId}
    `;
  }

  protected async execute(config: ParserConfigDto) {
    const { gameId } = config;

    this.logger.log('lastProcessedId');
    const lastProcessedId =
      await this.accountTransferAggregationService.getConditionParentId(
        'max',
        gameId,
      );

    const queryRunner = this.connection.createQueryRunner();

    this.logger.log('getProgress');
    const progress = await this.getProgress(config);

    // Account transaction RECEIPT / SPEND
    this.logger.log('assembleQuery SPEND BEGIN');
    await queryRunner.query(
      this.assembleQuery({
        gameId,
        state: AccountTransferState.SPEND,
        parentId: lastProcessedId,
      }),
    );
    this.logger.log('assembleQuery SPEND END');

    await this.progressSrv.nextStep(progress, config);
    this.progressSrv.cliDisplay(progress, config);

    // Account transaction RECEIPT / EARN
    this.logger.log('assembleQuery EARN BEGIN');
    await queryRunner.query(
      this.assembleQuery({
        gameId,
        state: AccountTransferState.EARN,
        parentId: lastProcessedId,
      }),
    );
    this.logger.log('assembleQuery EARN END');

    this.logger.log('nextStep');
    await this.progressSrv.nextStep(progress, config);
    this.logger.log('cliDisplay');
    this.progressSrv.cliDisplay(progress, config);
    this.logger.log('finish');
    await this.progressSrv.finish(progress);
  }

  protected getStepName() {
    return ProgressStage.STAGE_8;
  }

  protected async getProgress(config: ParserConfigDto) {
    const { gameId } = config;
    const isIncremental = false;
    const type = ProgressStage.STAGE_8;

    const dto = new CreateProgressDto({ gameId, type, end: 2, isIncremental });
    const progress = await this.progressSrv.get(dto);

    config.stepStartValue = progress.current_value;

    return progress;
  }
}
