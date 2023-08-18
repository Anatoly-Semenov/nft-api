import { MigrationInterface, QueryRunner } from 'typeorm';

export class userTransactionAggregationNullableProperties1660796200472
  implements MigrationInterface
{
  name = 'userTransactionAggregationNullableProperties1660796200472';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ALTER COLUMN "game_contract_type" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ALTER COLUMN "transaction_contract" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM user_transaction_aggregation WHERE created_at IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ALTER COLUMN "transaction_contract" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ALTER COLUMN "game_contract_type" SET NOT NULL`,
    );
  }
}
