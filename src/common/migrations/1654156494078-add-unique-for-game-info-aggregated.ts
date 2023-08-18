import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUniqueForGameInfoAggregated1654156494078
  implements MigrationInterface
{
  name = 'addUniqueForGameInfoAggregated1654156494078';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_info_aggregated" ADD CONSTRAINT "UQ_800dafbb45033f893545439f359" UNIQUE ("game_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_info_aggregated" DROP CONSTRAINT "UQ_800dafbb45033f893545439f359"`,
    );
  }
}
