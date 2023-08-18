import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserMintedAchievementsTable1667220006326
  implements MigrationInterface
{
  name = 'addUserMintedAchievementsTable1667220006326';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_minted_achievement" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "achievement_id" integer, "user_id" integer, CONSTRAINT "UQ_d5e7b14d83d3997013bcc31cdab" UNIQUE ("achievement_id", "user_id"), CONSTRAINT "PK_e805ecfdb0f0c62e7705ce48570" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_minted_achievement" ADD CONSTRAINT "FK_a9709adbfbe333a2080990c3597" FOREIGN KEY ("achievement_id") REFERENCES "achievement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_minted_achievement" ADD CONSTRAINT "FK_9834e52915e41c999bd7e31926d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_minted_achievement" DROP CONSTRAINT "FK_9834e52915e41c999bd7e31926d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_minted_achievement" DROP CONSTRAINT "FK_a9709adbfbe333a2080990c3597"`,
    );
    await queryRunner.query(`DROP TABLE "user_minted_achievement"`);
  }
}
