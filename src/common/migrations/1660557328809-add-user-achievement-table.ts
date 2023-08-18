import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserAchievementTable1660557328809
  implements MigrationInterface
{
  name = 'addUserAchievementTable1660557328809';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ae3274d080232cd2125e456ea2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_36f9877d6fb46a96ce292bd652"`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_achievement" ("id" SERIAL NOT NULL, "updated_ad" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "achievementId" integer, "userId" integer, "walletId" integer, CONSTRAINT "PK_99df4f0afe2d706c05004854aa5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "chain_parsing_progress" ("id" SERIAL NOT NULL, "started_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "game_id" integer, "start_value" integer NOT NULL, "current_value" integer NOT NULL, "end_value" integer NOT NULL, "time_left_ms" integer NOT NULL, "type" character varying NOT NULL, "step" integer NOT NULL DEFAULT '0', "status" character varying, "comment" text, CONSTRAINT "PK_bd14822d314b731555215242c79" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_achievement" ADD CONSTRAINT "FK_843ecd1965f1aac694875674a18" FOREIGN KEY ("achievementId") REFERENCES "achievement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_achievement" ADD CONSTRAINT "FK_2a418515c335cab7c5ba70c28b3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_achievement" ADD CONSTRAINT "FK_2f93ba095003f369dafd24909de" FOREIGN KEY ("walletId") REFERENCES "user_wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_achievement" DROP CONSTRAINT "FK_2f93ba095003f369dafd24909de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_achievement" DROP CONSTRAINT "FK_2a418515c335cab7c5ba70c28b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_achievement" DROP CONSTRAINT "FK_843ecd1965f1aac694875674a18"`,
    );
    await queryRunner.query(`DROP TABLE "chain_parsing_progress"`);
    await queryRunner.query(`DROP TABLE "user_achievement"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_36f9877d6fb46a96ce292bd652" ON "game_transaction" ("grab_internal") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ae3274d080232cd2125e456ea2" ON "game_transaction" ("game_id") `,
    );
  }
}
