import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexForSteamAchievements1665400190646
  implements MigrationInterface
{
  name = 'addIndexForSteamAchievements1665400190646';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_faef238477b53f36f29fa8a426" ON "steam_achievement" ("name", "steam_app_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_faef238477b53f36f29fa8a426"`,
    );
  }
}
