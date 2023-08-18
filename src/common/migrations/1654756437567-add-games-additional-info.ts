import { MigrationInterface, QueryRunner } from 'typeorm';

export class addGamesAdditionalInfo1654756437567 implements MigrationInterface {
  name = 'addGamesAdditionalInfo1654756437567';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "game_additional_info" ("id" SERIAL NOT NULL, "pictures" text array, "video" text array, "platforms" text array, "token" character varying, "token_address" character varying, "token_price" character varying, "backers" text array, "ido_date" character varying, "ino_date" character varying, "gameId" integer, CONSTRAINT "REL_35060cba909bb5e92cf15340d4" UNIQUE ("gameId"), CONSTRAINT "PK_baadf2b5c564ac066e397569643" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "game" ADD "genre" character varying`);
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" ADD CONSTRAINT "FK_35060cba909bb5e92cf15340d42" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_additional_info" DROP CONSTRAINT "FK_35060cba909bb5e92cf15340d42"`,
    );
    await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "genre"`);
    await queryRunner.query(`DROP TABLE "game_additional_info"`);
  }
}
