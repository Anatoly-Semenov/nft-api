import { MigrationInterface, QueryRunner } from 'typeorm';

export class newColumnForAggregation1666947548560
  implements MigrationInterface
{
  name = 'newColumnForAggregation1666947548560';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "solana_account_transfer_aggregation" ADD "token_decimal_place" integer NOT NULL DEFAULT '9'`,
    );
    await queryRunner.query(
      `ALTER TABLE "solana_account" ADD "is_mint" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "solana_account" DROP COLUMN "is_mint"`,
    );
    await queryRunner.query(
      `ALTER TABLE "solana_account_transfer_aggregation" DROP COLUMN "token_decimal_place"`,
    );
  }
}
