import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeGameInfoAggregatedIndexes1652844994989
  implements MigrationInterface
{
  name = 'changeGameInfoAggregatedIndexes1652844994989';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."unique_game_info_aggregated_game_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "unique_game_info_aggregated_game_id" ON "game_info_aggregated" ("game_id") `,
    );
  }
}
