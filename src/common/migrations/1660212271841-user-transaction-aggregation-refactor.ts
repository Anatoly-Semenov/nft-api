import { MigrationInterface, QueryRunner } from 'typeorm';

export class userTransactionAggregationRefactor1660212271841
  implements MigrationInterface
{
  name = 'userTransactionAggregationRefactor1660212271841';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "user_address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "first_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "game_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "game_contract_address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "main_account_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "second_account_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "main_address" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "second_address" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "main_first_time" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "second_first_time" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "is_contract" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "token_contract_title" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "transaction_contract" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "parent_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "parent_type" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::date`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "parent_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "parent_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "transaction_contract"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "token_contract_title"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "is_contract"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "second_first_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "main_first_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "second_address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "main_address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "second_account_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "main_account_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "game_contract_address" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "date" TIMESTAMP NOT NULL DEFAULT ('now'::text)::date`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "game_name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "first_time" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "user_address" text NOT NULL`,
    );
  }
}
