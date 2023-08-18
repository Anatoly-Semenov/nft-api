import { MigrationInterface, QueryRunner } from 'typeorm';

export class userTransactionAggregationChangeAmountType1660018617126
  implements MigrationInterface
{
  name = 'userTransactionAggregationChangeAmountType1660018617126';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP CONSTRAINT "UQ_40b7061c61f483336679f33a48b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "amount" numeric NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "amount" double precision NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD CONSTRAINT "UQ_40b7061c61f483336679f33a48b" UNIQUE ("game_id", "amount", "transaction_hash", "date")`,
    );
  }
}
