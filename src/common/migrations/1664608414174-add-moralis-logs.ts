import { MigrationInterface, QueryRunner } from 'typeorm';

export class addMoralisLogs1664608414174 implements MigrationInterface {
  name = 'addMoralisLogs1664608414174';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "profile_moralis_logs" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "content" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a64da40d16dbdfe6faa4dccf00f" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "profile_moralis_logs"`);
  }
}
