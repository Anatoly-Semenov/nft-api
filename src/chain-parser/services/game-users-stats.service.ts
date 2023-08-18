import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, MoreThanOrEqual, Repository } from 'typeorm';
import { GameUsersStats } from '../entities/game-users-stats.entity';
import * as moment from 'moment';

@Injectable()
export class GameUsersStatsService {
  private logger = new Logger(GameUsersStatsService.name);

  constructor(
    @InjectRepository(GameUsersStats)
    private readonly gameUsersStatsRepository: Repository<GameUsersStats>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async getGameStats(): Promise<void> {
    const currentDate = moment();
    let startedAt = moment().set('month', currentDate.get('month') - 4);
    startedAt = startedAt.startOf('month');

    const dateFrom = startedAt.format('YYYY-MM-DD');

    try {
      await Promise.all([
        this.getBaseCommonInfo(dateFrom),
        this.getNewUsers(dateFrom),
        this.getNewPlayingUsersStats(dateFrom),
        this.getNftBurnAndMint(dateFrom),
        this.getNftTrades(dateFrom),
      ]);
    } catch (error) {
      this.logger.error(error.message, error.stack);

      throw new BadRequestException(error.message);
    }
  }

  async getGameAverageEarnings(gameId: number) {
    const currentDate = moment();
    let startedAt = moment().set('month', currentDate.get('month') - 3);
    startedAt = startedAt.startOf('month');

    const dateFrom = startedAt.format('YYYY-MM-DD');

    const stats = await this.getStats(gameId, dateFrom, [
      'activeUsers',
      'average',
      'createdAt',
    ]);

    // Наименование аналогично старым методам
    const res = stats.map(({ createdAt, activeUsers, average }) => ({
      createdAt,
      average,
      users_count: activeUsers,
    }));

    return this.mapStats(res);
  }

  async getGameSpendingAndEarnings(gameId: number) {
    const formatTransactions = async (daysCount: number, limit = 3) => {
      const transactions = await this.getSpendEarnByPeriod(
        gameId,
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

  async getGameSpendersAndEarners(gameId: number) {
    const currentDate = moment();
    let startedAt = moment().set('month', currentDate.get('month') - 3);
    startedAt = startedAt.startOf('month');

    const dateFrom = startedAt.format('YYYY-MM-DD');

    const stats = await this.getStats(gameId, dateFrom, [
      'createdAt',
      'earners',
      'spenders',
      'earnings',
      'spending',
    ]);

    // Наименование аналогично старым методам
    const res = stats.map(({ earnings, ...stat }) => ({
      ...stat,
      earning: earnings,
    }));

    return this.mapStats(res);
  }

  async getActiveUsers(gameId: number) {
    const currentDate = moment();
    let startedAt = moment().set('month', currentDate.get('month') - 3);
    startedAt = startedAt.startOf('month');

    const dateFrom = startedAt.format('YYYY-MM-DD');

    const stats = await this.getStats(gameId, dateFrom, [
      'activeUsers',
      'newUsers',
      'createdAt',
    ]);

    // Наименование аналогично старым методам
    const res = stats.map(({ createdAt, activeUsers, newUsers }) => ({
      createdAt,
      active_users: activeUsers,
      new_users: newUsers,
    }));

    return this.mapStats(res);
  }

  async getNftTradesByGame(gameId: number) {
    const currentDate = moment();
    let startedAt = moment().set('month', currentDate.get('month') - 3);
    startedAt = startedAt.startOf('month');

    const dateFrom = startedAt.format('YYYY-MM-DD');

    const stats = await this.getStats(gameId, dateFrom, [
      'nftAmount',
      'nftTrades',
      'createdAt',
    ]);

    // Наименование аналогично старым методам
    const res = stats.map(({ createdAt, nftAmount, nftTrades }) => ({
      date: createdAt,
      amount: nftAmount,
      count: nftTrades,
    }));

    return { daily: res, weekly: [], monthly: [] };
  }

  async getNftBurnAndMintByGame(gameId: number) {
    const currentDate = moment();
    let startedAt = moment().set('month', currentDate.get('month') - 3);
    startedAt = startedAt.startOf('month');

    const dateFrom = startedAt.format('YYYY-MM-DD');

    const stats = await this.getStats(gameId, dateFrom, [
      'nftBurn',
      'nftMint',
      'createdAt',
    ]);

    // Наименование аналогично старым методам
    const res = stats.map(({ createdAt, nftBurn, nftMint }) => ({
      date: createdAt,
      mint: nftMint,
      burn: nftBurn,
    }));

    return { daily: res, weekly: [], monthly: [] };
  }

  private getStats = async (
    gameId: number,
    dateFrom: string,
    select?: (keyof GameUsersStats)[],
  ): Promise<GameUsersStats[]> => {
    const stats = await this.gameUsersStatsRepository.find({
      where: { game: { id: gameId }, createdAt: MoreThanOrEqual(dateFrom) },
      relations: ['game'],
      select,
      order: { createdAt: 'ASC' },
    });

    if (!stats.length) {
      return [];
    }

    return stats;
  };

  private mapStats(items: Record<string, any>[]): Record<string, any> {
    const result = {};

    items.forEach(({ game, createdAt, ...item }) => {
      result[moment(createdAt).format('DD.MM.YYYY')] = item;
    });

    return result;
  }

  private getSpendEarnByPeriod = async (
    gameId: number,
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

    const transactions = await this.getStats(
      gameId,
      dateFrom.format('YYYY-MM-DD'),
      [
        'createdAt',
        'newPayingUsers',
        'newEarners',
        'newEarnings',
        'newSpending',
      ],
    );

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
        moment(el.createdAt).endOf(period).isSame(searchDate.endOf(period)),
      );

      if (transaction) {
        const {
          createdAt: date,
          newPayingUsers: users,
          newEarners: earners,
          newEarnings: earnings,
          newSpending: spending,
        } = transaction;

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

  private getBaseCommonInfo = async (dateFrom: string) => {
    const query = `
      INSERT INTO game_users_stats (created_at, game_id, active_users, average, earners, spenders, earnings, spending)
      SELECT
        cata.date AS created_at,
        cata.game_id::int AS game_id,
        COUNT(DISTINCT cata.main_account_id)::int AS active_users,
        AVG(cata.average) AS average,
        COUNT(
          CASE WHEN cata.earn > 0 THEN
            1
          END)::int AS earners,
        COUNT(
          CASE WHEN cata.spend < 0 THEN
            1
          END)::int AS spenders,
        SUM(cata.earn) AS earning,
        SUM(cata.spend) AS spending
      FROM (
        SELECT
          DATE_TRUNC('day', created_at) AS date,
          main_account_id,
          game_id,
          AVG(
            CASE WHEN amount > 0 THEN
              amount * token_price / POW(10, token_decimal_place)
            ELSE
              0
            END) average,
          SUM(
            CASE WHEN amount > 0 THEN
              amount * token_price / POW(10, token_decimal_place)
            ELSE
              0
            END) AS earn,
          SUM(
            CASE WHEN amount < 0 THEN
              amount * token_price / POW(10, token_decimal_place)
            ELSE
              0
            END) AS spend
        FROM
          account_transfer_aggregation
        WHERE
          created_at >= '${dateFrom}'
          AND is_contract = FALSE
        GROUP BY
          main_account_id,
          game_id,
          date
        UNION
        SELECT
          DATE_TRUNC('day', created_at) AS date,
          main_account_id,
          game_id,
          AVG(
            CASE WHEN amount > 0 THEN
              amount * token_price / POW(10, token_decimal_place)
            ELSE
              0
            END) average,
          SUM(
            CASE WHEN amount > 0 THEN
              amount * token_price / POW(10, token_decimal_place)
            ELSE
              0
            END) AS earn,
          SUM(
            CASE WHEN amount < 0 THEN
              amount * token_price / POW(10, token_decimal_place)
            ELSE
              0
            END) AS spend
        FROM
          solana_account_transfer_aggregation
        WHERE
          created_at >= '${dateFrom}'
          AND is_contract = FALSE
        GROUP BY
          main_account_id,
          game_id,
          date) cata
      GROUP BY
        created_at,
        cata.game_id
      ORDER BY
        created_at DESC
      ON CONFLICT (game_id, created_at)
        DO UPDATE SET
          active_users = EXCLUDED.active_users,
          average = EXCLUDED.average,
          earners = EXCLUDED.earners,
          spenders = EXCLUDED.spenders,
          earnings = EXCLUDED.earnings,
          spending = EXCLUDED.spending;
    `;

    try {
      await this.connection.query(query);
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  };

  private getNewUsers = async (dateFrom: string) => {
    const query = `
      INSERT INTO game_users_stats (created_at, game_id, new_users)
      SELECT
        DATE_TRUNC('day', main_first_time) AS created_at,
        game_id,
        COUNT(DISTINCT main_account_id) AS new_users
      FROM
        solana_account_transfer_aggregation
      WHERE
        is_contract = FALSE
        AND main_first_time IS NOT NULL
        AND main_first_time > '${dateFrom}'
      GROUP BY
        game_id,
        DATE_TRUNC('day', main_first_time)
      UNION
      SELECT
        DATE_TRUNC('day', main_first_time) AS created_at,
        game_id,
        COUNT(DISTINCT main_account_id) AS new_users
      FROM
        account_transfer_aggregation
      WHERE
        is_contract = FALSE
        AND main_first_time IS NOT NULL
        AND main_first_time > '${dateFrom}'
      GROUP BY
        game_id,
        DATE_TRUNC('day', main_first_time)
      ORDER BY
        created_at DESC
      ON CONFLICT (game_id, created_at)
        DO UPDATE SET
          new_users = EXCLUDED.new_users;
    `;

    try {
      await this.connection.query(query);
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  };

  private getNewPlayingUsersStats = async (dateFrom: string) => {
    const query = `
      INSERT INTO game_users_stats (created_at, game_id, new_paying_users, new_earners, new_spenders, new_earnings, new_spending)
      SELECT
        DATE_TRUNC('day', tc.date) AS created_at,
        game_id,
        count(tc.main_account_id)::int AS users_count,
        count(
          CASE WHEN tc.earn + tc.spend > 0 THEN
            1
          END)::int AS earners,
        count(tc.main_account_id)::int - count(
          CASE WHEN tc.earn + tc.spend > 0 THEN
            1
          END)::int AS spenders,
        sum(tc.earn) AS earnings,
        sum(tc.spend) AS spending
      FROM (
        SELECT
          main_account_id,
          game_id,
          DATE_TRUNC('day', main_first_time) AS date,
          SUM(
            CASE WHEN amount > 0 THEN
              amount * token_price / POW(10, token_decimal_place)
            ELSE
              0
            END) AS earn,
          SUM(
            CASE WHEN amount < 0 THEN
              amount * token_price / POW(10, token_decimal_place)
            ELSE
              0
            END) AS spend
        FROM
          account_transfer_aggregation
        WHERE
          is_contract = FALSE
          AND main_first_time >= '${dateFrom}'
        GROUP BY
          main_account_id,
          game_id,
          date
        UNION
        SELECT
          main_account_id,
          game_id,
          DATE_TRUNC('day', main_first_time) AS date,
          SUM(
            CASE WHEN amount > 0 THEN
              amount * token_price / POW(10, token_decimal_place)
            ELSE
              0
            END) AS earn,
          SUM(
            CASE WHEN amount < 0 THEN
              amount * token_price / POW(10, token_decimal_place)
            ELSE
              0
            END) AS spend
        FROM
          solana_account_transfer_aggregation
        WHERE
          is_contract = FALSE
          AND main_first_time >= '${dateFrom}'
        GROUP BY
          main_account_id,
          game_id,
          date) tc
      WHERE
        tc.spend != 0
      GROUP BY
        date,
        game_id
      ORDER BY
        date DESC
      ON CONFLICT (game_id, created_at)
        DO UPDATE SET
          new_paying_users = EXCLUDED.new_paying_users,
          new_earners = EXCLUDED.new_earners,
          new_spenders = EXCLUDED.new_spenders,
          new_earnings = EXCLUDED.new_earnings,
          new_spending = EXCLUDED.new_spending;
    `;

    try {
      await this.connection.query(query);
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  };

  private getNftBurnAndMint = async (dateFrom: string) => {
    const query = `
      INSERT INTO game_users_stats (created_at, game_id, nft_mint, nft_burn)
      SELECT
        DATE_TRUNC('day', at.created_at) AS created_at,
        at.game_id,
        COUNT(
          CASE WHEN acc.id = at.from_account_id THEN
            1
          END)::int AS nft_mint,
        COUNT(
          CASE WHEN acc.id = at.to_account_id THEN
            1
          END)::int AS nft_burn
      FROM
        account acc
        LEFT JOIN account_transfer at ON at.game_id = acc.game_id
      WHERE
        at.token_id IS NOT NULL
        AND acc.address IN('0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000001', '0x000000000000000000000000000000000000dead')
        AND at.created_at > '${dateFrom}'
      GROUP BY
        DATE_TRUNC('day', at.created_at),
        at.game_id
      UNION
      SELECT
        DATE_TRUNC('day', sata.created_at) AS created_at,
        sata.game_id,
        COUNT(sata.main_address)::int AS nft_mint,
        0 AS nft_burn
      FROM
        solana_account sa
        JOIN solana_account_transfer_aggregation sata ON sa.address = sata.main_address
      WHERE
        sa.is_contract = TRUE
        AND sa.is_mint = TRUE
        AND sata.created_at > '${dateFrom}'
      GROUP BY
        DATE_TRUNC('day', sata.created_at),
        sata.game_id
      ORDER BY
        created_at DESC
      ON CONFLICT (game_id, created_at)
        DO UPDATE SET
          nft_mint = EXCLUDED.nft_mint,
          nft_burn = EXCLUDED.nft_burn;
    `;

    try {
      await this.connection.query(query);
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  };

  private getNftTrades = async (dateFrom: string) => {
    const query = `
      INSERT INTO game_users_stats (created_at, game_id, nft_amount, nft_trades)
      SELECT
        DATE_TRUNC('day', t.date) AS created_at,
        t.game_id,
        SUM(t.amount) AS nft_amount,
        COUNT(*)::int AS nft_trades
      FROM (
        SELECT
          MAX(tcp.price * at.amount / POW(10, tc.decimal_place)) AS amount,
          at.transaction_hash,
          at.created_at AS date,
          at.game_id
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
        at.token_id IS NULL
        AND at.created_at > '${dateFrom}'
        AND gc.type = 'MARKETPLACE'
      GROUP BY
        at.transaction_hash,
        at.created_at,
        at.game_id) t
      GROUP BY
        created_at,
        t.game_id
      UNION
      SELECT
        DATE_TRUNC('day', created_at),
        game_id,
        SUM(
          CASE WHEN amount != 0 THEN
            amount * - 1 * token_price / POW(10, token_decimal_place)
          ELSE
            0
          END) AS nft_amount,
        COUNT(*)::int AS nft_trades
      FROM
        solana_account_transfer_aggregation
      WHERE
        nft_parent_id IS NOT NULL
        AND amount <= 0
        AND created_at > '${dateFrom}'
      GROUP BY
        DATE_TRUNC('day', created_at),
        game_id
      ORDER BY
        created_at DESC
      ON CONFLICT (game_id, created_at)
        DO UPDATE SET
          nft_amount = EXCLUDED.nft_amount,
          nft_trades = EXCLUDED.nft_trades;
    `;

    try {
      await this.connection.query(query);
    } catch (error) {
      this.logger.error(error.message, error.stack);
    }
  };
}
