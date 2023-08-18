import { MigrationInterface, QueryRunner } from 'typeorm';

export class userTransactionAggregationAddProperties1660886328132
  implements MigrationInterface
{
  name = 'userTransactionAggregationAddProperties1660886328132';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "is_system" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "method" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "parent_type"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_transaction_aggregation_parent_type_enum" AS ENUM('LOG', 'RECEIPT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "parent_type" "public"."user_transaction_aggregation_parent_type_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "parent_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_transaction_aggregation_parent_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" ADD "parent_type" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "method"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_transaction_aggregation" DROP COLUMN "is_system"`,
    );
  }
}
