import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAirdropsModule1653592139303 implements MigrationInterface {
  name = 'addAirdropsModule1653592139303';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "airdrop" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "image" character varying, "startAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a6aea5b153cdf587fdbb38c5acc" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "airdrop"`);
  }
}
