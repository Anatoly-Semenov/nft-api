import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldsToAnalyticsPlayerUserTable1651486690658
  implements MigrationInterface
{
  name = 'addFieldsToAnalyticsPlayerUserTable1651486690658';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "analytics_player_user"
        ADD "gameId" integer NOT NULL DEFAULT '-1'`);
    await queryRunner.query(`ALTER TABLE "analytics_player_user"
        ADD "discord" character varying NOT NULL DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "analytics_player_user" DROP COLUMN "discord"`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics_player_user" DROP COLUMN "gameId"`,
    );
  }
}
