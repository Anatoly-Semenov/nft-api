import { EntityRepository, getConnection, IsNull } from 'typeorm';
import { BaseRepository } from './base.repository';
import { AccountTransferAggregation } from '../entities/account-transfer-aggregation.entity';

@EntityRepository(AccountTransferAggregation)
export class AccountTransferAggregationRepository extends BaseRepository<AccountTransferAggregation> {
  protected entityTarget;

  constructor() {
    super();
    this.entityTarget = AccountTransferAggregation;
  }

  public async getTokenWithoutPriceIds(gameId) {
    const data = await this.createQueryBuilder()
      .select('DISTINCT token_contract_id AS id')
      .where({
        gameId,
        tokenPrice: IsNull(),
      })
      .getRawMany();

    return data.map((item) => item.id);
  }

  updateEntityWithoutPrice(gameId) {
    // language=PostgreSQL
    const query = `
        UPDATE account_transfer_aggregation ata
        SET token_price = (SELECT price
                           FROM token_contract_price tcp
                           WHERE ata.token_contract_id = tcp.token_contract_id
                             AND ata.created_at::date = tcp.created_at::date LIMIT 1)
        WHERE ata.token_price IS NULL
          AND game_id = $1;
    `;

    return getConnection().query(query, [gameId]);
  }
}
