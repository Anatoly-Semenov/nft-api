import { MigrationInterface, QueryRunner } from 'typeorm';

export class addParserAutostartTable1662023478116
  implements MigrationInterface
{
  name = 'addParserAutostartTable1662023478116';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "parser_autostart" ("id" SERIAL NOT NULL, "game_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL, "finished_at" TIMESTAMP NOT NULL, "status" character varying NOT NULL, CONSTRAINT "PK_308ba9432e2dc3ed57e0de0717c" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "parser_autostart"`);
  }
}
