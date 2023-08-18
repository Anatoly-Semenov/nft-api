import * as moment from 'moment';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Game } from 'src/games/entities/game.entity';
import { UserWallet } from 'src/users/entities/user-wallet.entity';
import { User } from 'src/users/entities/user.entity';
import { Connection } from 'typeorm';
import { AccountTransferAggregationRepository } from '../repositories/account-transfer-aggregation.repository';
import { ContractService } from './contract.service';
import { ChartsQueryDto } from '../dto/charts-query.dto';

export type GetAccountTransferPayload = {
  gameId: Game['id'];
  userWalletAddress: User['walletAddress'];
};

export type GetAccountTransferEarnSpend = {
  gameId: Game['id'];
  earn: number;
  spend: number;
};

export type GetRawListEarnSpendGroupByWalletPayload = {
  gameId: Game['id'];
  walletAddresses: UserWallet['wallet'][];
  state?: 'earn' | 'spend' | 'breakeven';
};

export type GetRawListEarnSpendGroupByWallet = {
  earn?: number;
  spend?: number;
  breakeven?: number;
  wallet: string;
};

export type ResultOfAchievementRule = {
  payload: number;
  wallet: UserWallet['wallet'];
};

@Injectable()
export class AccountTransferAggregationService {
  private readonly logger = new Logger(AccountTransferAggregationService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectRepository(AccountTransferAggregationRepository)
    private readonly repository: AccountTransferAggregationRepository,
    private readonly contractService: ContractService,
  ) {}

  async getEarnSpend(
    payload: GetAccountTransferPayload,
  ): Promise<GetAccountTransferEarnSpend> {
    //TODO: избавиться от константы в методе POW
    const transactions = await this.connection.query(`
      SELECT
        SUM(CASE WHEN amount > 0 THEN amount * token_price / POW(10, 18) ELSE 0 END) as earn,
        SUM(CASE WHEN amount < 0 THEN amount * token_price / POW(10, 18) ELSE 0 END) as spend,
        main_address
      FROM
        account_transfer_aggregation
      WHERE
        main_address = '${payload.userWalletAddress}'
        AND is_contract = FALSE
        AND game_id = ${payload.gameId}
      GROUP BY
        main_address;
    `);

    if (!transactions.length) {
      return { gameId: payload.gameId, earn: 0, spend: 0 };
    }

    const { earn, spend } = transactions[0];

    return { gameId: payload.gameId, earn, spend: Math.abs(spend) };
  }

  getSpendUSDByWallets(gameId, walletAddresses) {
    if (!walletAddresses.length) return null;

    const addresses = walletAddresses.map((addr) => `'${addr}'`).join(',');

    //TODO: SELECT -SUM(amount * token_price) =====>>> SELECT SUM(amount * token_price) потому что в БД стоит - у ачивки

    //TODO: избавиться от константы в методе POW
    // language=PostgreSQL
    const query = `
        SELECT SUM(amount * token_price) / pow(10, 18) AS amount, main_address AS wallet
        FROM account_transfer_aggregation
        WHERE game_id = $1
          AND main_address IN (${addresses})
          AND amount < 0
        GROUP BY main_address;
    `;

    return this.connection.query(query, [gameId]);
  }

  getEarnUSDByWallets(gameId, walletAddresses) {
    if (!walletAddresses.length) return null;

    const addresses = walletAddresses.map((addr) => `'${addr}'`).join(',');

    //TODO: избавиться от константы в методе POW
    // language=PostgreSQL
    const query = `
        SELECT SUM(amount * token_price) / pow(10, 18) AS amount, main_address AS wallet
        FROM account_transfer_aggregation
        WHERE game_id = $1
          AND main_address IN (${addresses})
          AND amount > 0
        GROUP BY main_address;
    `;

    return this.connection.query(query, [gameId]);
  }

  getEarnCoinByWallets(gameId, walletAddresses, tokenAddress) {
    if (!walletAddresses.length) return null;

    const addresses = walletAddresses.map((addr) => `'${addr}'`).join(',');

    //TODO: избавиться от константы в методе POW
    // language=PostgreSQL
    const query = `
        SELECT SUM(amount) / pow(10, 18) AS amount, main_address AS wallet
        FROM account_transfer_aggregation
        WHERE game_id = $1
          AND main_address IN (${addresses})
          AND amount > 0
          AND token_contract_address = '${tokenAddress}'
        GROUP BY main_address;
    `;

    return this.connection.query(query, [gameId]);
  }

  getBreakeven(gameId, walletAddresses) {
    if (!walletAddresses.length) return null;

    const addresses = walletAddresses.map((addr) => `'${addr}'`).join(',');

    //TODO: избавиться от константы в методе POW
    // language=PostgreSQL
    const query = `
        SELECT SUM(amount * token_price) / pow(10, 18) AS amount, main_address AS wallet
        FROM account_transfer_aggregation
        WHERE game_id = $1
          AND main_address IN (${addresses})
        GROUP BY main_address
    `;

    return this.connection.query(query, [gameId]);
  }

  // Fasten version of getEarnSpend()
  async getRawEarnSpend(
    gameIds: Game['id'][],
    wallet: User['walletAddress'],
  ): Promise<GetAccountTransferEarnSpend[]> {
    //TODO: избавиться от константы в методе POW
    // language=PostgreSQL
    const transactions = await this.connection.query(`
      SELECT
        SUM(CASE WHEN amount > 0 THEN amount * token_price / POW(10, 18) ELSE 0 END) as earn,
        SUM(CASE WHEN amount < 0 THEN amount * token_price / POW(10, 18) ELSE 0 END) as spend,
        game_id as "gameId"
      FROM
        account_transfer_aggregation
      WHERE
        main_address = '${wallet}'
        AND is_contract = FALSE
        AND game_id IN(${gameIds.join(',')})
      GROUP BY
        game_id;
  `);

    if (!transactions.length) {
      throw new NotFoundException('Transactions not found');
    }

    return transactions;
  }

  async removeDuplicates(): Promise<void> {
    // language=PostgreSQL
    await this.connection.query(`
        delete
        from account_transfer_aggregation
        where id in (select id
                     from (select id, row_number() over w as rnum
                           from account_transfer_aggregation uta window w as (
                               partition by uta.parent_id
                               )) t
                     where t.rnum > 3)
    `);
  }

  async getConditionParentId(
    condition: 'max' | 'min',
    gameId: number,
  ): Promise<number> {
    const raw = await this.connection.query(`
        select ${condition}(uta.parent_id)
        from account_transfer_aggregation uta
        WHERE game_id = ${gameId}
    `);

    return Number(raw[0][condition]);
  }

  async getGameAverageEarnings(
    gameId: number,
    chartsQueryDto: ChartsQueryDto,
  ): Promise<Record<string, { users_count: number; average: number }>> {
    const { isSolana } = chartsQueryDto;

    const currentDate = moment();
    let startedAt = moment().set('month', currentDate.get('month') - 2);
    startedAt = startedAt.startOf('month');

    const table = isSolana
      ? 'solana_account_transfer_aggregation'
      : 'account_transfer_aggregation';

    try {
      const transactions = await this.connection.query(`
          SELECT
            COUNT(DISTINCT main_account_id)::int as users_count,
            AVG(token_price * amount / POW(10, token_decimal_place)) as average,
            DATE_TRUNC('day', created_at) AS date
          FROM
            ${table}
          WHERE
              game_id = ${gameId}
            AND is_contract = FALSE
            AND amount
              > 0
            AND created_at
              > '${startedAt.format('YYYY-MM-DD')}'
          GROUP BY
              date
      `);

      if (!transactions.length) {
        throw new NotFoundException('Transactions not found');
      }

      const result: Record<string, { users_count: number; average: number }> =
        {};

      transactions.forEach(({ users_count, date, average }) => {
        result[moment(date).format('DD.MM.YYYY')] = {
          users_count,
          average,
        };
      });

      return result;
    } catch (error) {
      throw new BadRequestException(error.message, error);
    }
  }

  async getGameSpendingAndEarnings(
    gameId: number,
    chartsQueryDto: ChartsQueryDto,
  ) {
    const { isSolana } = chartsQueryDto;

    const formatTransactions = async (daysCount: number, limit = 3) => {
      const transactions = await this.getSpendEarnByPeriod(
        gameId,
        isSolana,
        'day',
        daysCount,
      );
      const itemsCount = transactions.length / limit;

      const result = [];

      for (let i = 0; i < transactions.length; i += itemsCount) {
        const items = transactions.slice(i, itemsCount + i);
        const data = items.reduce(
          (prev, item) => ({
            ...prev,
            users_count: prev.users_count + item.users_count,
            earners: prev.earners + item.earners,
            earnings: prev.earnings + item.earnings,
            spending: prev.spending + item.spending,
          }),
          {
            users_count: 0,
            earners: 0,
            earnings: 0,
            spending: 0,
            percent_in_profit: 0,
            avg_roi: 0,
            started_at: items[0].started_at,
            ended_at: items[items.length - 1].ended_at,
          },
        );

        data.percent_in_profit = (data.earners / data.users_count) * 100;
        data.avg_roi = (data.earnings - data.spending) / data.spending;

        result.push(data);
      }

      return result;
    };

    const [weekly, monthly] = await Promise.all([
      formatTransactions(21, 3),
      formatTransactions(90, 3),
    ]);

    return {
      weekly,
      monthly,
    };
  }

  async getGameSpendersAndEarners(
    gameId: number,
    chartsQueryDto: ChartsQueryDto,
  ) {
    const { isSolana } = chartsQueryDto;

    try {
      const currentDate = moment();
      let startedAt = moment().set('month', currentDate.get('month') - 2);
      startedAt = startedAt.startOf('month');

      const table = isSolana
        ? 'solana_account_transfer_aggregation'
        : 'account_transfer_aggregation';

      const transactions = await this.connection.query(`
          SELECT tc.day as date,
          count(
            CASE WHEN tc.earn > 0 THEN
              1
            END)::int AS earners,
          count(
            CASE WHEN tc.spend < 0 THEN
              1
            END)::int AS spenders,
          sum(tc.earn) AS earning,
          sum(tc.spend) AS spending
          FROM (
              SELECT
                main_account_id,
                DATE_TRUNC('day', created_at) AS day,
                SUM (
                  CASE WHEN amount > 0 THEN
                    amount * token_price / POW(10, token_decimal_place)
                  ELSE
                    0
                  END) AS earn,
                SUM (
                  CASE WHEN amount < 0 THEN
                    amount * token_price / POW(10, token_decimal_place)
                  ELSE
                    0
                  END) AS spend
              FROM
                ${table}
              WHERE
                game_id = ${gameId}
                AND is_contract = FALSE
                AND created_at > '${startedAt.format('YYYY-MM-DD')}'
              GROUP BY
                main_account_id,
                day) tc
          GROUP BY
              date
          ORDER BY
              date ASC
      `);

      if (!transactions.length) {
        throw new NotFoundException('Transactions not found');
      }

      const result: Record<
        string,
        { earning: number; spending: number; earners: number; spenders: number }
      > = {};

      transactions.forEach(({ date, earners, spenders, earning, spending }) => {
        result[moment(date).format('DD.MM.YYYY')] = {
          earners,
          spenders,
          earning,
          spending,
        };
      });

      return result;
    } catch (error) {
      throw new BadRequestException(error.message, error);
    }
  }

  async getActiveUsers(gameId: number, chartsQueryDto: ChartsQueryDto) {
    const { isSolana } = chartsQueryDto;

    const currentDate = moment();
    let startedAt = moment().set('month', currentDate.get('month') - 2);
    startedAt = startedAt.startOf('month');

    const newUsersQuery = this.connection.query(`
        SELECT DATE_TRUNC('day', main_first_time) as date, COUNT(DISTINCT main_account_id) as new_users
        FROM ${
          isSolana
            ? 'solana_account_transfer_aggregation'
            : 'account_transfer_aggregation'
        }
        WHERE game_id = ${gameId}
          AND is_contract = false
          AND main_first_time IS NOT NULL
          AND main_first_time
            > '${startedAt.format('YYYY-MM-DD')}'
        GROUP BY date
        ORDER BY date ASC
    `);

    const activeUsersQuery = this.connection.query(`
        SELECT
          DATE_TRUNC('day', created_at) as date,
          ${
            isSolana
              ? 'COUNT(DISTINCT main_account_id)'
              : 'COUNT(DISTINCT from_account_id) + COUNT(DISTINCT to_account_id)'
          } as active_users
        FROM ${
          isSolana ? 'solana_account_transfer_aggregation' : 'account_transfer'
        }
        WHERE game_id = ${gameId} AND created_at IS NOT NULL AND created_at > '${startedAt.format(
      'YYYY-MM-DD',
    )}'
        GROUP BY date
        ORDER BY date ASC
    `);

    const [newUsers, activeUsers] = await Promise.all([
      newUsersQuery,
      activeUsersQuery,
    ]);

    const users = [...newUsers, ...activeUsers].reduce((days, user) => {
      const date = moment(user.date);
      const data = days[date.format('DD.MM.YYYY')] || {
        active_users: 0,
        new_users: 0,
      };

      data.active_users += parseInt(user.active_users, 10) || 0;
      data.new_users += parseInt(user.new_users, 10) || 0;

      return { ...days, [date.format('DD.MM.YYYY')]: data };
    }, {});

    return users;
  }

  public getTokenWithoutPriceIds(gameId) {
    return this.repository.getTokenWithoutPriceIds(gameId);
  }

  public updateEntityWithoutPrice(gameId) {
    return this.repository.updateEntityWithoutPrice(gameId);
  }

  private getSpendEarnByPeriod = async (
    gameId: number,
    isSolana: boolean,
    period: 'day' | 'week' | 'month',
    limit = 1,
  ) => {
    const currentDate = moment();
    let dateFrom = moment().set(period, currentDate.get(period) - limit);

    if (period === 'week') {
      dateFrom = dateFrom.endOf(period).isoWeekday(1);
    } else {
      dateFrom = dateFrom.startOf(period);
    }

    const table = isSolana
      ? 'solana_account_transfer_aggregation'
      : 'account_transfer_aggregation';

    const transactions = await this.connection.query(`
        SELECT DATE_TRUNC('${period}', tc.day) AS date,
        count(tc.main_account_id)::int AS users,
        count(
          CASE WHEN tc.earn + tc.spend > 0 THEN
            1
          END)::int AS earners,
        sum(tc.earn) AS earnings,
        sum(tc.spend) AS spending
        FROM (
            SELECT
              main_account_id,
              DATE_TRUNC('day', main_first_time) AS day,
              SUM (
                CASE WHEN amount > 0 THEN
                  amount * token_price / POW(10, token_decimal_place)
                ELSE
                  0
                END) AS earn,
              SUM (
                CASE WHEN amount < 0 THEN
                  amount * token_price / POW(10, token_decimal_place)
                ELSE
                  0
                END) AS spend
            FROM
              ${table}
            WHERE
              game_id = ${gameId}
              AND is_contract = FALSE
              AND main_first_time >= '${dateFrom.format('YYYY-MM-DD')}'
            GROUP BY
              main_account_id,
              day) tc
        WHERE
            tc.spend != 0
        GROUP BY
            date
        ORDER BY
            date ASC
    `);

    if (!transactions.length) {
      return [];
    }

    const result = [];

    const updatedPeriod = period === 'day' ? 'dayOfYear' : period;

    for (
      let i = dateFrom.get(updatedPeriod);
      i <= currentDate.get(updatedPeriod);
      i++
    ) {
      const searchDate = moment().set(updatedPeriod, i);

      const transaction = transactions.find((el) =>
        moment(el.date).endOf(period).isSame(searchDate.endOf(period)),
      );

      if (transaction) {
        const { date, users, earners, earnings, spending } = transaction;

        result.push({
          users_count: users,
          earners,
          earnings,
          spending: Math.abs(spending),
          percent_in_profit: (earners / users) * 100,
          avg_roi: (earnings - Math.abs(spending)) / Math.abs(spending),
          started_at: moment(date).startOf(period).toISOString(),
          ended_at: moment(date).endOf(period).toISOString(),
        });
      } else {
        result.push({
          users_count: 0,
          earners: 0,
          earnings: 0,
          spending: 0,
          percent_in_profit: 0,
          avg_roi: 0,
          started_at: searchDate.startOf(period).toISOString(),
          ended_at: searchDate.endOf(period).toISOString(),
        });
      }
    }

    return result;
  };

  async getSolanaEarnCoinByWallets(
    gameId: number,
    walletAddresses: string[],
    tokenAddress: string,
  ) {
    if (!walletAddresses.length) return null;

    const addresses = walletAddresses.map((addr) => `'${addr}'`).join(',');

    // language=PostgreSQL
    const query = `
      SELECT SUM(amount / pow(10, token_decimal_place)) AS amount, main_address AS wallet
      FROM solana_account_transfer_aggregation
      WHERE game_id = $1
        AND main_address IN (${addresses})
        AND second_account_id IN (SELECT id FROM solana_account WHERE is_contract = true AND game_id = $1)
        AND transfer_type = 'EARN'
        AND nft_parent_id IS NULL
        AND token_contract_address = '${tokenAddress}'
      GROUP BY main_address;
    `;

    return this.connection.query(query, [gameId]);
  }

  async getSolanaSpendUSDByWallets(gameId, walletAddresses) {
    if (!walletAddresses.length) return null;

    const addresses = walletAddresses.map((addr) => `'${addr}'`).join(',');

    // language=PostgreSQL
    const query = `
      SELECT SUM(amount * token_price / pow(10, token_decimal_place)) * -1 AS amount, main_address AS wallet
      FROM solana_account_transfer_aggregation
      WHERE game_id = $1
        AND main_address IN (${addresses})
        AND second_account_id IN (SELECT id FROM solana_account WHERE is_contract = true AND game_id = $1)
        AND transfer_type = 'SPEND'
        AND nft_parent_id IS NULL
      GROUP BY main_address
    `;

    return this.connection.query(query, [gameId]);
  }

  async getSolanaEarnUSDByWallets(gameId, walletAddresses) {
    if (!walletAddresses.length) return null;

    const addresses = walletAddresses.map((addr) => `'${addr}'`).join(',');

    // language=PostgreSQL
    const query = `
      SELECT SUM(amount * token_price / pow(10, token_decimal_place)) AS amount, main_address AS wallet
      FROM solana_account_transfer_aggregation
      WHERE game_id = $1
        AND main_address IN (${addresses})
        AND second_account_id IN (SELECT id FROM solana_account WHERE is_contract = true AND game_id = $1)
        AND transfer_type = 'EARN'
        AND nft_parent_id IS NULL
      GROUP BY main_address;
    `;

    return this.connection.query(query, [gameId]);
  }
}
