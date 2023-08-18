import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { ContractService } from './contract.service';
import { TransferDto } from '../dto/transfer.dto';
import { AccountService } from './account.service';
import { AccountTransfer } from '../entities/account-transfer.entity';
import { ParserConfigDto } from '../dto/parser-config.dto';
import { GameTransaction } from '../entities/game-transaction.entity';
import * as moment from 'moment';
import { filterArrayByAnotherArray } from '../../common/utils/array.utils';
import { ChartsQueryDto } from '../dto/charts-query.dto';

@Injectable()
export class AccountTransferService {
  constructor(
    private contractSrv: ContractService,
    private accountService: AccountService,
    @InjectConnection() private readonly connection: Connection,
    @InjectRepository(AccountTransfer)
    private accountTransferRepository: Repository<AccountTransfer>,
    @InjectRepository(GameTransaction)
    private gameTransactionRepository: Repository<GameTransaction>,
  ) {}

  /**
   * Create internal transactions by blockchain transfers
   *
   * @param transfers
   * @param config
   */
  async create(transfers: TransferDto[], config: ParserConfigDto) {
    const entities = await Promise.all(
      transfers.map((item) => this.mapTransfers(item, config)),
    );

    return this.accountTransferRepository.save(entities, {
      chunk: 1000,
      listeners: false,
      transaction: false,
      reload: false,
    });
  }

  async filterKnown(config: ParserConfigDto, list, from, to) {
    if (!list || list.length === 0) return [];
    console.time('filterKnown');

    const { gameId } = config;

    const existing = await this.accountTransferRepository
      .createQueryBuilder()
      .select('transaction_hash as hash')
      .where('game_id = :gameId')
      .andWhere('transaction_hash IN (:...list)')
      .andWhere('block_number BETWEEN :from AND :to')
      .setParameters({ gameId, list, from, to })
      .getRawMany();

    const result = filterArrayByAnotherArray(
      list,
      existing.map((item) => item.hash),
    );

    console.timeEnd('filterKnown');

    return result;
  }

  changeTokenContractId(fromId: number, toId: number) {
    return this.accountTransferRepository.update(
      { tokenContractId: fromId },
      { tokenContractId: toId },
    );
  }

  setCreatedDateAndContract(gameId: number) {
    // language=PostgreSQL
    const query = `
        UPDATE account_transfer
        SET (created_at, transaction_contract) = (SELECT timestamp, address_to
                                                  FROM transactions_bsc
                                                  WHERE tx_hash = transaction_hash
                                                  LIMIT 1)
        WHERE game_id = $1
          AND (created_at IS NULL OR transaction_contract IS NULL);
    `;

    return this.connection.query(query, [gameId]);
  }

  private async mapTransfers(transfer: TransferDto, config: ParserConfigDto) {
    const gameId = transfer.gameId;

    const [tokenContract, accountFrom, accountTo] = await Promise.all([
      this.contractSrv.getTokenByAddress(transfer.tokenContract, config),
      this.accountService.getAccount(transfer.from),
      this.accountService.getAccount(transfer.to),
    ]);

    const entity = new AccountTransfer();
    entity.fromAccountId = accountFrom.id;
    entity.toAccountId = accountTo.id;
    entity.createdAt = transfer.transactionCreatedAt;
    entity.transactionHash = transfer.transactionHash;
    entity.tokenId = transfer.tokenId;
    entity.tokenContractId = tokenContract.id;
    entity.amount = transfer.amount;
    entity.gameId = gameId;
    entity.blockNumber = transfer.blockNumber;
    entity.transactionContract = transfer.transactionTo;
    entity.method = transfer.method;
    entity.parsingStage = config.currentStep;

    return entity;
  }

  async getNftTradesByGame(gameId: number, chartsQueryDto: ChartsQueryDto) {
    const { isSolana } = chartsQueryDto;

    const currentDate = moment();
    let startedAt = moment().set('month', currentDate.get('month') - 2);
    startedAt = startedAt.startOf('month');

    const queries = ['day', 'week', 'month'].map((period) =>
      isSolana
        ? this.getSolanaNftTrades(
            gameId,
            period,
            startedAt.format('YYYY-MM-DD'),
          )
        : this.getBscNftTrades(gameId, period, startedAt.format('YYYY-MM-DD')),
    );

    const [daily, weekly, monthly] = await Promise.all(queries);

    if (!daily.length) {
      return { daily: [], weekly: [], monthly: [] };
    }

    return { daily, weekly, monthly };
  }

  private getBscNftTrades = (
    gameId: number,
    period: string,
    dateFrom: string,
  ) =>
    this.connection.query(`
      SELECT
        DATE_TRUNC('${period}', t.created_at) AS date,
        SUM(t.amount) AS amount,
        COUNT(*)::int AS count
      FROM (
        SELECT
          MAX(tcp.price * at.amount / POW(10, tc.decimal_place)) AS amount,
          at.transaction_hash,
          at.created_at
        FROM
          account_transfer at
        LEFT JOIN game_contract gc ON gc.game_id = at.game_id
          AND at.transaction_contract = gc.address
        LEFT JOIN account_transfer nft ON nft.token_id IS NOT NULL
          AND at.transaction_hash = nft.transaction_hash
        LEFT JOIN token_contract_price tcp ON tcp.token_contract_id = at.token_contract_id
          AND DATE_TRUNC('day', tcp.created_at) = DATE_TRUNC('day', at.created_at)
        LEFT JOIN token_contract tc ON tc.id = at.token_contract_id
        WHERE
          at.game_id = ${gameId}
          AND at.token_id IS NULL
          AND at.created_at > '${dateFrom}'
          AND gc.type = 'MARKETPLACE'
        GROUP BY
          at.transaction_hash,
          at.created_at
      ) t
      GROUP BY
        date
      ORDER BY
        date ASC
    `);

  private getSolanaNftTrades = (
    gameId: number,
    period: string,
    dateFrom: string,
  ) =>
    this.connection.query(`
      SELECT
        DATE_TRUNC('${period}', created_at) AS date,
        SUM(amount * -1 * token_price / POW(10, token_decimal_place)) AS amount,
        COUNT(*)::int AS count
      FROM
        solana_account_transfer_aggregation
      WHERE
        nft_parent_id IS NOT NULL
        AND amount <= 0
        AND game_id = ${gameId}
        AND created_at > '${dateFrom}'
      GROUP BY
        date
      ORDER BY
        date ASC;
  `);
}
