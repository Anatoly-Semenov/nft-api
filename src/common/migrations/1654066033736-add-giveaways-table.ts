import { MigrationInterface, QueryRunner } from 'typeorm';

export class addGiveawaysTable1654066033736 implements MigrationInterface {
  name = 'addGiveawaysTable1654066033736';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "giveaway" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "image" text NOT NULL, "link_to_project" text NOT NULL, "prize_description" text NOT NULL, "link_to_join" text NOT NULL, "start_date" TIMESTAMP NOT NULL, "end_date" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fdbebb79a049e10c16e3df5d447" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "giveaway"`);
  }
}
