import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexesToAccountTransferAggregation1668412558026
  implements MigrationInterface
{
  name = 'addIndexesToAccountTransferAggregation1668412558026';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_4336b909377130f5eb9b041a65" ON "account_transfer_aggregation" ("parent_id", "game_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4336b909377130f5eb9b041a65"`,
    );
  }
}
