import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeParserProgressTable1659717280829
  implements MigrationInterface
{
  name = 'changeParserProgressTable1659717280829';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "chain_parsing_progress"`);

    await queryRunner.query(
      `CREATE TABLE "parser_progress" ("id" SERIAL NOT NULL, "started_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "game_id" integer, "start_value" integer NOT NULL, "current_value" integer NOT NULL, "end_value" integer NOT NULL, "time_left_ms" integer NOT NULL, "type" character varying NOT NULL, "step" integer NOT NULL DEFAULT '0', "status" character varying, CONSTRAINT "PK_c11854db40ffde1c0bae141a2b5" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `CREATE TABLE "parser_log" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL, "parser_progress_id" integer NOT NULL, "current_value" integer NOT NULL, "comment" text, CONSTRAINT "PK_66ac2ac923aa2ab80fe15ff4cda" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "parser_log"`);
    await queryRunner.query(`DROP TABLE "parser_progress"`);
  }
}
