import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexToUserAchievement1664897472376
  implements MigrationInterface
{
  name = 'addIndexToUserAchievement1664897472376';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_1a3e7d4bc29820df358499ee37" ON "user_achievement" ("achievementId", "userId", "walletId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1a3e7d4bc29820df358499ee37"`,
    );
  }
}
