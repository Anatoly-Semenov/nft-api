import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedNewColumnsToSolanaAggregationTable1665919592365
  implements MigrationInterface
{
  name = 'addedNewColumnsToSolanaAggregationTable1665919592365';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "solana_account_transfer_aggregation" ADD "nft_parent_id" integer`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."solana_account_transfer_aggregation_transfer_type_enum" AS ENUM('EARN', 'SPEND')`,
    );
    await queryRunner.query(
      `ALTER TABLE "solana_account_transfer_aggregation" ADD "transfer_type" "public"."solana_account_transfer_aggregation_transfer_type_enum" NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "solana_account_transfer_aggregation" DROP COLUMN "transfer_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."solana_account_transfer_aggregation_transfer_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "solana_account_transfer_aggregation" DROP COLUMN "nft_parent_id"`,
    );
  }
}
