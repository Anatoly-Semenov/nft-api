import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, IsNull, Repository } from 'typeorm';
import { SolanaAccountTransferAggregation } from '../entities/solana-account-transfer-aggregation.entity';
import { SolanaAccountTransferEnum } from '../enums/solana-account-transfer.enum';
import { SolanaGameIdEnum } from '../enums/solana-game-id.enum';

export const SOLANA_ACCOUNT_TRANSFER_AGGREGATION_REPOSITORY_SERVICE_NAME =
  'SOLANA_ACCOUNT_TRANSFER_AGGREGATION_REPOSITORY';

@Injectable()
export class SolanaAccountTransferAggregationRepository {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectRepository(SolanaAccountTransferAggregation)
    private readonly repository: Repository<SolanaAccountTransferAggregation>,
  ) {}

  async getMaxColumnValue(
    column: 'parent_id' | 'nft_parent_id',
    type: SolanaAccountTransferEnum,
    gameId: SolanaGameIdEnum,
  ): Promise<number> {
    const raw = await this.repository.query(`
        select max(sata.${column}) as mx
        from solana_account_transfer_aggregation sata
        WHERE game_id = ${gameId} and transfer_type = '${type}';
    `);

    return Number(raw[0]['mx']) || 0;
  }

  async copyNewTransferList(
    gameId: SolanaGameIdEnum,
    state: SolanaAccountTransferEnum,
    parentId: number,
  ) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.query(
      this.assembleCopyTransferListQuery(gameId, state, parentId),
    );
  }

  async copyNewNftMovement(
    gameId: SolanaGameIdEnum,
    state: SolanaAccountTransferEnum,
    parentId: number,
  ) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.query(
      this.assembleCopyNftMovementQuery(gameId, state, parentId),
    );
  }

  async removeDuplicate(gameId: SolanaGameIdEnum) {
    // language=PostgreSQL
    await this.repository.query(
      `
          delete from solana_account_transfer_aggregation
          where parent_id is not null and
              nft_parent_id is null and
              game_id = $1 and
              transaction_hash in (select transaction_hash
                                   from solana_nft_transfer
                                   where solana_nft_transfer.game_id = $1 and
                                       solana_nft_transfer.buyer_amount is not null and solana_nft_transfer.buyer_amount > 0 and
                                       solana_nft_transfer.seller_amount is not null and solana_nft_transfer.seller_amount > 0);
      `,
      [gameId],
    );
  }

  async updateEntityWithoutPrice(gameId) {
    // language=PostgreSQL
    const query = `
        UPDATE solana_account_transfer_aggregation sata
        SET token_price = (SELECT price
                           FROM token_contract_price tcp
                           WHERE sata.token_contract_id = tcp.token_contract_id
                             AND sata.created_at::date = tcp.created_at::date LIMIT 1)
        WHERE sata.token_price IS NULL
          AND sata.game_id = $1;
    `;

    await this.connection.createQueryRunner().query(query, [gameId]);
  }

  async getTokenWithoutPriceIds(gameId: SolanaGameIdEnum): Promise<number[]> {
    const data = await this.repository
      .createQueryBuilder()
      .select('DISTINCT token_contract_id AS id')
      .where({
        gameId,
        tokenPrice: IsNull(),
      })
      .getRawMany();

    return data.map((item) => item.id);
  }

  private assembleCopyNftMovementQuery(
    gameId: SolanaGameIdEnum,
    state: SolanaAccountTransferEnum,
    parentId: number,
  ): string {
    const mainAccount = state === SolanaAccountTransferEnum.SPEND ? 'at' : 'af';
    const secondAccount =
      state === SolanaAccountTransferEnum.SPEND ? 'af' : 'at';

    return `
      insert into solana_account_transfer_aggregation(
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
          nft_parent_id,
          is_system,
          method,
          transfer_type,
          token_decimal_place
      ) select
        ${mainAccount}.id,
        ${mainAccount}.address,
        ${mainAccount}.first_time,
        ${secondAccount}.id,
        ${secondAccount}.address,
        ${secondAccount}.first_time,
        ${mainAccount}.is_contract,
        tc.id,
        tc.title,
        tc.address,
        tcp.price,
        ${
          state === SolanaAccountTransferEnum.SPEND
            ? '-t.buyer_amount as amount'
            : 't.seller_amount as amount'
        },
        t.created_at,
        t.game_id,
        null,
        t.transaction_hash,
        null,
        'GAME',
        null,
        t.id as nft_parent_id,
        false,
        null,
        '${state}',
        tc.decimal_place
        from solana_nft_transfer as t
          join solana_account af on t.from_account_id = af.id
          join solana_account at on t.to_account_id = at.id
          join solana_token_contract stc on t.token_contract_id = stc.id
          join token_contract tc on stc.token_contract_id = tc.id
          left join token_contract_price tcp on tcp.id = (select id
                                                       from token_contract_price tcp2
                                                       where tcp2.token_contract_id = tc.id
                                                         and tcp2.created_at::date = t.created_at::date
                                                       order by tcp2.created_at ASC
                                                       limit 1)
        where t.game_id = ${gameId} and t.id > ${parentId};
    `;
  }

  private assembleCopyTransferListQuery(
    gameId: SolanaGameIdEnum,
    state: SolanaAccountTransferEnum,
    parentId: number,
  ): string {
    const mainAccount = state === SolanaAccountTransferEnum.SPEND ? 'af' : 'at';
    const secondAccount =
      state === SolanaAccountTransferEnum.SPEND ? 'at' : 'af';

    return `
      insert into solana_account_transfer_aggregation(
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
          nft_parent_id,
          is_system,
          method,
          transfer_type,
          token_decimal_place
      ) select
            ${mainAccount}.id,
            ${mainAccount}.address,
            ${mainAccount}.first_time,
            ${secondAccount}.id,
            ${secondAccount}.address,
            ${secondAccount}.first_time,
            ${mainAccount}.is_contract,
            tc.id,
            tc.title,
            tc.address,
            tcp.price,
            ${
              state === SolanaAccountTransferEnum.SPEND
                ? '-t.amount as amount'
                : 't.amount as amount'
            },
            t.created_at,
            t.game_id,
            null,
            t.transaction_hash,
            null,
            'GAME',
            t.id as parent_id,
            null,
            false,
            null,
            '${state}',
            tc.decimal_place
      from solana_account_transaction as t
        join solana_account af on t.from_account_id = af.id
        join solana_account at on t.to_account_id = at.id
        join solana_token_contract stc on t.token_contract_id = stc.id
        join token_contract tc on stc.token_contract_id = tc.id
        left join token_contract_price tcp on tcp.id = (select id
                                                       from token_contract_price tcp2
                                                       where tcp2.token_contract_id = tc.id
                                                         and tcp2.created_at::date = t.created_at::date
                                                       order by tcp2.created_at ASC
                                                       limit 1)
      where t.game_id = ${gameId} and t.id > ${parentId};
      `;
  }
}
