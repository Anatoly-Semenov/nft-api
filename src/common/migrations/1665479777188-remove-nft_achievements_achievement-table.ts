import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeNftAchievementsAchievementTable1665479777188
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_achievements_achievement" DROP CONSTRAINT "FK_9d243f5af5248715ac8c4810dc5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_achievements_achievement" DROP CONSTRAINT "FK_454df42d94ff4f901b4a2673e66"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9d243f5af5248715ac8c4810dc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_454df42d94ff4f901b4a2673e6"`,
    );
    await queryRunner.query(`DROP TABLE "user_achievements_achievement"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_achievements_achievement" ("userId" integer NOT NULL, "achievementId" integer NOT NULL, CONSTRAINT "PK_de5198701472166889507ed4d9e" PRIMARY KEY ("userId", "achievementId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_454df42d94ff4f901b4a2673e6" ON "user_achievements_achievement" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9d243f5af5248715ac8c4810dc" ON "user_achievements_achievement" ("achievementId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_achievements_achievement" ADD CONSTRAINT "FK_454df42d94ff4f901b4a2673e66" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_achievements_achievement" ADD CONSTRAINT "FK_9d243f5af5248715ac8c4810dc5" FOREIGN KEY ("achievementId") REFERENCES "achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
