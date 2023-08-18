import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Between, Connection, Repository } from 'typeorm';
import { ContractService } from './contract.service';
import { GameTransaction } from '../entities/game-transaction.entity';
import { ParserProgress } from '../entities/parser-progress.entity';
import { INPUT_BLACK_LIST } from './raw-transaction.service';
import { RawTransaction } from '../types/RawTransaction';

@Injectable()
export class GameTransactionService {
  constructor(
    private contractSrv: ContractService,
    @InjectConnection() private readonly connection: Connection,
    @InjectRepository(GameTransaction)
    private gameTransactionRepository: Repository<GameTransaction>,
  ) {}

  getByGame(gameId: number, progress: ParserProgress, grabInternal = false) {
    return this.gameTransactionRepository.find({
      where: {
        gameId,
        grabInternal,
        id: Between(progress.current_value, progress.end_value),
      },
      order: { id: 'ASC' },
      take: progress.step,
    });
  }

  async getMaxByEntireGame(gameId: number) {
    const result = await this.gameTransactionRepository
      .createQueryBuilder()
      .select('MAX(block_number) AS max')
      .where({ gameId })
      .getRawOne();

    return result?.max || 0;
  }

  async getLimitsByGame(gameId: number, grabInternal = false) {
    const result = await this.gameTransactionRepository
      .createQueryBuilder()
      .select('MIN(id) AS min, MAX(id) AS max')
      .where({
        gameId,
        grabInternal,
      })
      .getRawOne();

    return [result?.min || 0, result?.max || 0];
  }

  async getKnownAddresses(gameId: number): Promise<string[]> {
    try {
      const result = await this.gameTransactionRepository
        .createQueryBuilder()
        .select('address_to')
        .where({ gameId })
        .groupBy('address_to')
        .getRawMany();

      return result.map((item) => item.address_to);
    } catch (e) {
      throw new Error(e);
    }
  }

  async getLastBlock(gameId: number) {
    const result = await this.gameTransactionRepository
      .createQueryBuilder()
      .select('MAX(block_number) AS block')
      .where({ gameId })
      .getRawOne();

    return result?.block || 0;
  }

  saveByUnknownAddresses(addressList: string[], gameId: number) {
    if (!addressList.length) return;

    const list = "'" + addressList.join("', '") + "'";
    const excludedMethods = "'" + INPUT_BLACK_LIST.join("', '") + "'";

    const cond = `tb.address_to IN (${list}) AND tb.input NOT IN (${excludedMethods})`;
    const query = this.getQuery(cond);

    return this.connection.query(query, [gameId]);
  }

  saveByKnownAddresses(
    addressList: string[],
    gameId: number,
    blockNumber: number,
    knownHashList: string[],
  ) {
    if (!addressList.length) return;

    const list = "'" + addressList.join("', '") + "'";
    const excludedMethods = "'" + INPUT_BLACK_LIST.join("', '") + "'";
    const excludeHashList = knownHashList.length
      ? "'" + knownHashList.join("', '") + "'"
      : 'null';

    const cond = `tb.address_to IN (${list}) AND tb.input NOT IN (${excludedMethods}) 
    AND tb.block_number >= $2 AND tb.tx_hash NOT IN (${excludeHashList})`;
    const query = this.getQuery(cond);

    return this.connection.query(query, [gameId, blockNumber]);
  }

  async hashListByBlock(gameId: number, blockNumber: number) {
    const result = await this.gameTransactionRepository
      .createQueryBuilder()
      .select('transaction_hash')
      .where({ gameId, blockNumber })
      .getRawMany();

    return result.map((item) => item.transaction_hash);
  }

  async getByHashList(
    gameId: number,
    list: string[],
  ): Promise<GameTransaction[]> {
    if (!list.length) return [];

    const inCond = "'" + list.join("', '") + "'";

    const cond = `tb.tx_hash IN (${inCond})`;
    const query = this.getSubQuery(cond);

    const rawList = await this.connection.query(query, [gameId]);
    return rawList.map((item) => this.mapRawToEntity(item));
  }

  private getQuery(whereCondition: string) {
    return `
        INSERT INTO game_transaction (game_id, transaction_hash, block_number, created_at,
                                      address_from, address_to, value, input, grab_internal)
                (${this.getSubQuery(whereCondition)});
    `;
  }

  private getSubQuery(whereCondition: string) {
    // language=PostgreSQL
    return `SELECT $1 AS game_id,
                   tb.tx_hash,
                   tb.block_number,
                   tb.timestamp,
                   tb.address_from,
                   tb.address_to,
                   tb.value::numeric,
                   tb.input,
                   CASE
                       WHEN tb.value::numeric > 0 THEN true
                       WHEN count(gc.id) > 0 THEN true
                       ELSE false
                       END AS grab_internal
            FROM transactions_bsc tb
                     LEFT JOIN game_contract gc
                               ON tb.address_to = gc.address AND gc.force_grab_internal = true
            WHERE ${whereCondition}
              AND tb.input IS NOT NULL
            GROUP BY tb.tx_hash, tb.block_number, tb.timestamp, tb.address_from, tb.address_to, tb.value, tb.input
            ORDER BY tb.block_number`;
  }

  private mapRawToEntity(raw: RawTransaction) {
    const result = new GameTransaction();
    result.gameId = raw.game_id;
    result.transactionHash = raw.tx_hash;
    result.blockNumber = raw.block_number;
    result.createdAt = raw.timestamp;
    result.addressFrom = raw.address_from;
    result.addressTo = raw.address_to;
    result.value = raw.value;
    result.grabInternal = raw.grab_internal;
    result.input = raw.input;

    return result;
  }
}
