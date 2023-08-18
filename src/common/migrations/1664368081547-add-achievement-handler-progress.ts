import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAchievementHandlerProgress1664368081547
  implements MigrationInterface
{
  name = 'addAchievementHandlerProgress1664368081547';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."achievement_progress_status_enum" AS ENUM('waiting', 'completed', 'failed', 'stopped')`,
    );
    await queryRunner.query(
      `CREATE TABLE "achievement_progress" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "status" "public"."achievement_progress_status_enum" NOT NULL DEFAULT 'waiting', "started_at" TIMESTAMP NOT NULL, "finished_at" TIMESTAMP NOT NULL, CONSTRAINT "UQ_b615f4d226f61db44ab1a852be1" UNIQUE ("user_id"), CONSTRAINT "PK_901cc379a8dbe909f3d617c0da1" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "achievement_progress"`);
    await queryRunner.query(
      `DROP TYPE "public"."achievement_progress_status_enum"`,
    );
  }
}
