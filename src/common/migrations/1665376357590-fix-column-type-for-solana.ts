import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixColumnTypeForSolana1665376357590 implements MigrationInterface {
  name = 'fixColumnTypeForSolana1665376357590';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "solana_account_transfer_aggregation" ALTER COLUMN "block_number" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "solana_account_transfer_aggregation" ALTER COLUMN "parent_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "solana_account_transfer_aggregation" ALTER COLUMN "parent_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "solana_account_transfer_aggregation" ALTER COLUMN "block_number" SET NOT NULL`,
    );
  }
}
