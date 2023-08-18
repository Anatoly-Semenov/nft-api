import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexToAccountTransferAggregation1665710912560
  implements MigrationInterface
{
  name = 'addIndexToAccountTransferAggregation1665710912560';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_3b0229e27204ef9e48bb3bfd17" ON "account_transfer_aggregation" ("main_address") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3b0229e27204ef9e48bb3bfd17"`,
    );
  }
}
