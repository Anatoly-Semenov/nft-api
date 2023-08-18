import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRewardsTable1666343859690 implements MigrationInterface {
  name = 'addRewardsTable1666343859690';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "reward" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "amount" integer NOT NULL DEFAULT '0', "description" character varying, "currency" character varying, "image" character varying, "started_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::date, "ended_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a90ea606c229e380fb341838036" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "reward"`);
  }
}
