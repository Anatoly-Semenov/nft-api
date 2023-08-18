import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1647525028032 implements MigrationInterface {
  name = 'Init1647525028032';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "article_game"
             (
                 "id"         SERIAL  NOT NULL,
                 "article_id" integer NOT NULL,
                 "game_id"    integer NOT NULL,
                 CONSTRAINT "PK_c989bf2960e106fc9fd8e3fa879" PRIMARY KEY ("id")
             )`,
    );
    await queryRunner.query(
      `CREATE TABLE "game"
             (
                 "id"                   SERIAL            NOT NULL,
                 "title"                character varying NOT NULL,
                 "min_investment_token" integer           NOT NULL,
                 "token_title"          character varying NOT NULL,
                 "release_date"         character varying NOT NULL,
                 "chain_title"          character varying NOT NULL,
                 "description"          character varying NOT NULL,
                 "in_use"               boolean           NOT NULL,
                 "site"                 character varying NOT NULL,
                 "image"                character varying NOT NULL,
                 CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id")
             )`,
    );
    await queryRunner.query(
      `CREATE TABLE "article"
             (
                 "id"      SERIAL            NOT NULL,
                 "title"   character varying NOT NULL,
                 "content" text              NOT NULL,
                 CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id")
             )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "article"`);
    await queryRunner.query(`DROP TABLE "game"`);
    await queryRunner.query(`DROP TABLE "article_game"`);
  }
}
