import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSteamAchievements1665394400733 implements MigrationInterface {
  name = 'addSteamAchievements1665394400733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "steam_achievement" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "display_name" character varying NOT NULL, "description" character varying NOT NULL, "image" character varying NOT NULL, "steam_app_id" integer NOT NULL, "game_id" integer, CONSTRAINT "PK_dd9554f331215c7f7a8a56380ed" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "game" ADD "steam_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "steam_achievement" ADD CONSTRAINT "FK_16d6c3d89f93e030c051dac247f" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "steam_achievement" DROP CONSTRAINT "FK_16d6c3d89f93e030c051dac247f"`,
    );
    await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "steam_id"`);
    await queryRunner.query(`DROP TABLE "steam_achievement"`);
  }
}
